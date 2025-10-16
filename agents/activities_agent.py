"""
Activities Agent (ADK + A2A Protocol)

This agent suggests activities based on weather forecasts and user preferences.
It exposes an A2A Protocol endpoint and can be called by the orchestrator.

Features:
- Suggests activities matched to weather conditions
- Filters by interests, budget, and group size
- Returns structured activity recommendations
- Provides indoor/outdoor alternatives
"""

import uvicorn
import os
import json
from typing import List, Literal
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


class Activity(BaseModel):
    name: str = Field(description="Activity name")
    category: str = Field(description="Category (e.g., 'Outdoor Adventure', 'Cultural', 'Dining', 'Entertainment')")
    description: str = Field(description="Detailed activity description")
    duration_minutes: int = Field(description="Estimated duration in minutes")
    estimated_cost: int = Field(description="Estimated cost in USD")
    weather_appropriate: bool = Field(description="Whether this activity is appropriate for the forecasted weather")
    indoor_outdoor: Literal["indoor", "outdoor", "both"] = Field(description="Whether activity is indoor, outdoor, or both")
    best_time: str = Field(description="Best time of day (e.g., 'Morning', 'Afternoon', 'Evening')")
    location: str = Field(description="Specific location or area")


class StructuredActivities(BaseModel):
    destination: str = Field(description="Destination city/location")
    activities: List[Activity] = Field(description="List of recommended activities")
    weather_summary: str = Field(description="Brief weather summary for context")
    planning_tips: List[str] = Field(description="Tips for planning activities around weather")


class ActivitiesRequest(BaseModel):
    """Input format for activities agent requests"""
    destination: str = Field(description="Destination city/location")
    dates: List[str] = Field(description="List of dates (e.g., ['2025-10-20', '2025-10-21'])")
    weather_forecast: dict = Field(description="Weather forecast data from weather agent")
    interests: List[str] = Field(description="User interests (e.g., ['outdoor', 'culture', 'food', 'adventure'])")
    budget: str = Field(description="Budget level: 'low', 'medium', 'high'")
    group_size: int = Field(description="Number of people in the group")


class ActivitiesAgent:
    """
    Activity recommendation agent powered by Google ADK and Gemini.

    This agent suggests activities based on weather conditions and user preferences
    using the A2A Protocol. It accepts structured JSON inputs with location,
    dates, and weather data, returning personalized activity recommendations.

    The agent uses Google's Gemini model to generate activity suggestions that
    match weather conditions and travel preferences.

    Attributes:
        _agent: The underlying LlmAgent instance
        _user_id: User ID for session management
        _runner: ADK Runner for executing the agent
    """

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
            name='activities_agent',
            description='An agent that suggests activities based on weather and user preferences',
            instruction="""
You are an activities recommendation agent for travelers. Your role is to suggest activities
that match the weather conditions and user preferences.

You will receive a structured request with:
- Destination city/location
- Dates and weather forecast data
- User interests (e.g., outdoor, culture, food, adventure)
- Budget level (low/medium/high)
- Group size

Return ONLY a valid JSON object with this exact structure:
{
  "destination": "City Name",
  "activities": [
    {
      "name": "Activity Name",
      "category": "Category",
      "description": "Detailed description of the activity",
      "duration_minutes": 120,
      "estimated_cost": 50,
      "weather_appropriate": true,
      "indoor_outdoor": "outdoor",
      "best_time": "Morning",
      "location": "Specific location or area"
    }
  ],
  "weather_summary": "Brief summary of weather conditions",
  "planning_tips": ["Tip 1", "Tip 2", "Tip 3"]
}

Guidelines:
- Match activities to weather conditions (indoor on rainy days, outdoor on sunny days)
- Filter by user interests (prioritize activities matching their interests)
- Respect budget constraints (low: $0-30, medium: $30-100, high: $100+)
- Consider group size (group-friendly vs solo activities)
- Provide 5-8 diverse activity suggestions
- Include mix of indoor and outdoor options for flexibility
- Add practical planning tips based on weather patterns

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
            validated_activities = StructuredActivities(**structured_data)
            final_response = json.dumps(validated_activities.model_dump(), indent=2)
            print("✅ Successfully created structured activities recommendations")
            return final_response
        except json.JSONDecodeError as e:
            print(f"❌ JSON parsing error: {e}")
            print(f"Content: {content_str}")
            return json.dumps({
                "error": "Failed to generate structured activities",
                "raw_content": content_str[:200]
            })
        except Exception as e:
            print(f"❌ Validation error: {e}")
            return json.dumps({
                "error": f"Validation failed: {str(e)}"
            })


# Build the A2A Starlette app
base_url = os.getenv("ACTIVITIES_PUBLIC_URL")

skill = AgentSkill(
    id='activities_agent',
    name='Activities Recommendation Agent',
    description='Suggests activities based on weather forecasts and user preferences using ADK. Expects JSON input with destination, dates, weather_forecast, interests, budget, and group_size fields.',
    tags=['travel', 'activities', 'recommendations', 'weather-aware', 'adk'],
    examples=[
        '{"destination": "Tokyo", "dates": ["2025-10-20", "2025-10-21"], "weather_forecast": {"forecast": [{"condition": "Sunny", "highTemp": 75}]}, "interests": ["culture", "food"], "budget": "medium", "group_size": 2}',
        '{"destination": "Paris", "dates": ["2025-11-15", "2025-11-16"], "weather_forecast": {"forecast": [{"condition": "Rainy", "highTemp": 55}]}, "interests": ["art", "history"], "budget": "high", "group_size": 4}',
        '{"destination": "San Francisco", "dates": ["2025-12-01", "2025-12-02"], "weather_forecast": {"forecast": [{"condition": "Cloudy", "highTemp": 60}]}, "interests": ["outdoor", "adventure"], "budget": "low", "group_size": 1}'
    ],
)

public_agent_card = AgentCard(
    name='Activities Agent',
    description='ADK-powered agent that suggests activities based on weather and user preferences',
    url=base_url or "",
    version="1.0.0",
    defaultInputModes=["text"],
    defaultOutputModes=["text"],
    capabilities=AgentCapabilities(streaming=True),
    skills=[skill],
    supportsAuthenticatedExtendedCard=False,
)

class ActivitiesAgentExecutor(AgentExecutor):
    def __init__(self):
        self.agent = ActivitiesAgent()

    async def execute(
        self,
        context: RequestContext,
        event_queue: EventQueue,
    ) -> None:
        try:
            # Parse and validate JSON input
            raw_input = context.get_user_input()
            input_data = json.loads(raw_input)
            activities_request = ActivitiesRequest(**input_data)

            # Format structured request into prompt for ADK agent
            dates_str = ", ".join(activities_request.dates)
            interests_str = ", ".join(activities_request.interests)
            weather_str = json.dumps(activities_request.weather_forecast, indent=2)

            query = f"""Suggest activities for {activities_request.destination} for the following dates: {dates_str}

Weather Forecast:
{weather_str}

User Preferences:
- Interests: {interests_str}
- Budget: {activities_request.budget}
- Group Size: {activities_request.group_size} people

Please provide activity recommendations that match the weather and preferences."""

            session_id = getattr(context, 'context_id', 'default_session')
            final_content = await self.agent.invoke(query, session_id)
            await event_queue.enqueue_event(new_agent_text_message(final_content))

        except json.JSONDecodeError as e:
            error_msg = json.dumps({
                "error": "Invalid JSON input",
                "message": f"Failed to parse input as JSON: {str(e)}",
                "expected_format": {
                    "destination": "string",
                    "dates": ["YYYY-MM-DD"],
                    "weather_forecast": "object",
                    "interests": ["string"],
                    "budget": "low|medium|high",
                    "group_size": "number"
                }
            })
            await event_queue.enqueue_event(new_agent_text_message(error_msg))

        except Exception as e:
            error_msg = json.dumps({
                "error": "Invalid input format",
                "message": str(e),
                "expected_format": {
                    "destination": "string",
                    "dates": ["YYYY-MM-DD"],
                    "weather_forecast": "object",
                    "interests": ["string"],
                    "budget": "low|medium|high",
                    "group_size": "number"
                }
            })
            await event_queue.enqueue_event(new_agent_text_message(error_msg))

    async def cancel(
        self, context: RequestContext, event_queue: EventQueue
    ) -> None:
        raise Exception('cancel not supported')

request_handler = DefaultRequestHandler(
    agent_executor=ActivitiesAgentExecutor(),
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
    port = int(os.getenv("ACTIVITIES_PORT", 9006))
    print(f"🎯 Starting Activities Agent on http://localhost:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
