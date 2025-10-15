"""
Weather Agent (ADK + A2A Protocol)

This agent provides weather forecasts and travel weather advice.
It exposes an A2A Protocol endpoint and can be called by the orchestrator.

Features:
- Provides weather forecasts for travel destinations
- Returns structured JSON with weather predictions
- Helps travelers plan activities based on weather conditions
"""

import uvicorn
import os
import json
from typing import List
from dotenv import load_dotenv
from pydantic import BaseModel, Field

load_dotenv()

# A2A Protocol imports
from a2a.server.apps import A2AStarletteApplication
from a2a.server.request_handlers import DefaultRequestHandler
from a2a.server.tasks import InMemoryTaskStore
from a2a.types import (
    AgentCapabilities,
    AgentCard,
    AgentSkill,
)
from a2a.server.agent_execution import AgentExecutor, RequestContext
from a2a.server.events import EventQueue
from a2a.utils import new_agent_text_message

# Google ADK imports
from google.adk.agents.llm_agent import LlmAgent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.adk.memory.in_memory_memory_service import InMemoryMemoryService
from google.adk.artifacts import InMemoryArtifactService
from google.genai import types


class DailyWeather(BaseModel):
    day: int = Field(description="Day number")
    date: str = Field(description="Date (e.g., 'Dec 15')")
    condition: str = Field(description="Weather condition (e.g., 'Sunny', 'Rainy', 'Cloudy')")
    highTemp: int = Field(description="High temperature in Fahrenheit")
    lowTemp: int = Field(description="Low temperature in Fahrenheit")
    precipitation: int = Field(description="Chance of precipitation as percentage")
    humidity: int = Field(description="Humidity percentage")
    windSpeed: int = Field(description="Wind speed in mph")
    description: str = Field(description="Detailed weather description")


class StructuredWeather(BaseModel):
    destination: str = Field(description="Destination city/location")
    forecast: List[DailyWeather] = Field(description="Daily weather forecasts")
    travelAdvice: str = Field(description="Weather-based travel advice and what to pack")
    bestDays: List[int] = Field(description="Best days for outdoor activities based on weather")


class WeatherRequest(BaseModel):
    """Input format for weather agent requests"""
    city: str = Field(description="Destination city/location")
    dates: List[str] = Field(description="List of dates for forecast (e.g., ['2025-10-20', '2025-10-21'])")


class WeatherAgent:
    def __init__(self):
        self._agent = self._build_agent()
        self._user_id = 'remote_agent'
        self._runner = Runner(
            app_name=self._agent.name,
            agent=self._agent,
            artifact_service=InMemoryArtifactService(),
            session_service=InMemorySessionService(),
            memory_service=InMemoryMemoryService(),
        )

    def _build_agent(self) -> LlmAgent:
        model_name = os.getenv('GEMINI_MODEL', 'gemini-2.5-flash')

        return LlmAgent(
            model=model_name,
            name='weather_agent',
            description='An agent that provides weather forecasts and travel weather advice',
            instruction="""
You are a weather forecast agent for travelers. Your role is to provide realistic weather
predictions and help travelers prepare for weather conditions.

You will receive a structured request specifying:
- The destination city/location
- Specific dates for the forecast

Return ONLY a valid JSON object with this exact structure:
{
  "destination": "City Name",
  "forecast": [
    {
      "day": 1,
      "date": "Dec 15",
      "condition": "Sunny",
      "highTemp": 75,
      "lowTemp": 60,
      "precipitation": 10,
      "humidity": 45,
      "windSpeed": 8,
      "description": "Clear skies with pleasant temperatures, perfect for sightseeing"
    }
  ],
  "travelAdvice": "Pack light layers, sunscreen, and comfortable walking shoes. Evenings may be cool, so bring a light jacket.",
  "bestDays": [1, 3, 5]
}

Provide weather forecasts based on:
- Typical weather patterns for that destination and season
- Realistic temperature ranges
- Appropriate precipitation chances
- Helpful packing advice
- Identification of best days for outdoor activities

Make forecasts realistic for the destination's climate and current season.
Include helpful travel advice based on the weather conditions.

Return ONLY valid JSON, no markdown code blocks, no other text.
            """,
            tools=[],
        )

    async def invoke(self, query: str, session_id: str) -> str:
        session = await self._runner.session_service.get_session(
            app_name=self._agent.name,
            user_id=self._user_id,
            session_id=session_id,
        )

        content = types.Content(
            role='user', parts=[types.Part.from_text(text=query)]
        )

        if session is None:
            session = await self._runner.session_service.create_session(
                app_name=self._agent.name,
                user_id=self._user_id,
                state={},
                session_id=session_id,
            )

        response_text = ''
        async for event in self._runner.run_async(
            user_id=self._user_id,
            session_id=session.id,
            new_message=content
        ):
            if event.is_final_response():
                if (
                    event.content
                    and event.content.parts
                    and event.content.parts[0].text
                ):
                    response_text = '\n'.join(
                        [p.text for p in event.content.parts if p.text]
                    )
                break

        content_str = response_text.strip()

        if "```json" in content_str:
            content_str = content_str.split("```json")[1].split("```")[0].strip()
        elif "```" in content_str:
            content_str = content_str.split("```")[1].split("```")[0].strip()

        try:
            structured_data = json.loads(content_str)
            validated_weather = StructuredWeather(**structured_data)
            final_response = json.dumps(validated_weather.model_dump(), indent=2)
            print("✅ Successfully created structured weather forecast")
            return final_response
        except json.JSONDecodeError as e:
            print(f"❌ JSON parsing error: {e}")
            print(f"Content: {content_str}")
            return json.dumps({
                "error": "Failed to generate structured weather forecast",
                "raw_content": content_str[:200]
            })
        except Exception as e:
            print(f"❌ Validation error: {e}")
            return json.dumps({
                "error": f"Validation failed: {str(e)}"
            })


# Build the A2A Starlette app.
# Set the public URL via env so cards don’t point at localhost.
base_url = os.getenv("WEATHER_PUBLIC_URL")  # e.g. https://your-app.vercel.app/api/itinerary

skill = AgentSkill(
    id='weather_agent',
    name='Weather Forecast Agent',
    description='Provides weather forecasts and travel weather advice using ADK. Expects JSON input with city and dates fields.',
    tags=['travel', 'weather', 'forecast', 'climate', 'adk'],
    examples=[
        '{"city": "Tokyo", "dates": ["2025-10-20", "2025-10-21", "2025-10-22"]}',
        '{"city": "Paris", "dates": ["2025-11-15", "2025-11-16"]}',
        '{"city": "New York", "dates": ["2025-12-01", "2025-12-02", "2025-12-03", "2025-12-04", "2025-12-05"]}'
    ],
)

public_agent_card = AgentCard(
    name='Weather Agent',
    description='ADK-powered agent that provides weather forecasts and packing advice for travelers',
    url=base_url or "",  # recommended to set in prod
    version="1.0.0",
    defaultInputModes=["text"],
    defaultOutputModes=["text"],
    capabilities=AgentCapabilities(streaming=True),
    skills=[skill],
    supportsAuthenticatedExtendedCard=False,
)

class WeatherAgentExecutor(AgentExecutor):
    def __init__(self):
        self.agent = WeatherAgent()

    async def execute(
        self,
        context: RequestContext,
        event_queue: EventQueue,
    ) -> None:
        try:
            # Parse and validate JSON input
            raw_input = context.get_user_input()
            input_data = json.loads(raw_input)
            weather_request = WeatherRequest(**input_data)

            # Format structured request into prompt for ADK agent
            dates_str = ", ".join(weather_request.dates)
            query = f"Provide a weather forecast for {weather_request.city} for the following dates: {dates_str}"

            session_id = getattr(context, 'context_id', 'default_session')
            final_content = await self.agent.invoke(query, session_id)
            await event_queue.enqueue_event(new_agent_text_message(final_content))

        except json.JSONDecodeError as e:
            error_msg = json.dumps({
                "error": "Invalid JSON input",
                "message": f"Failed to parse input as JSON: {str(e)}",
                "expected_format": {
                    "city": "string",
                    "dates": ["YYYY-MM-DD", "..."]
                }
            })
            await event_queue.enqueue_event(new_agent_text_message(error_msg))

        except Exception as e:
            error_msg = json.dumps({
                "error": "Invalid input format",
                "message": str(e),
                "expected_format": {
                    "city": "string",
                    "dates": ["YYYY-MM-DD", "..."]
                }
            })
            await event_queue.enqueue_event(new_agent_text_message(error_msg))

    async def cancel(
        self, context: RequestContext, event_queue: EventQueue
    ) -> None:
        raise Exception('cancel not supported')

request_handler = DefaultRequestHandler(
    agent_executor=WeatherAgentExecutor(),
    task_store=InMemoryTaskStore(),
)

server = A2AStarletteApplication(
    agent_card=public_agent_card,
    http_handler=request_handler,
    extended_agent_card=public_agent_card,
)

# This is the ASGI app entry that Vercel invokes
app = server.build()


if __name__ == "__main__":
    port = int(os.getenv("WEATHER_PORT", 9005))
    print(f"🗺️ Starting Weather Agent on http://localhost:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
