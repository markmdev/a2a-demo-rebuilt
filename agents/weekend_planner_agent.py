"""
Weekend Planner Agent (ADK + A2A Protocol)

This agent synthesizes weather and activity data into a cohesive weekend plan.
It exposes an A2A Protocol endpoint and can be called by the orchestrator.

Features:
- Creates day-by-day weekend schedules
- Organizes activities with optimal timing
- Considers weather patterns for scheduling
- Provides transitions and practical tips
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


class ScheduledActivity(BaseModel):
    time: str = Field(description="Scheduled time (e.g., '9:00 AM - 11:00 AM')")
    activity_name: str = Field(description="Name of the activity")
    location: str = Field(description="Location of the activity")
    duration_minutes: int = Field(description="Duration in minutes")
    notes: str = Field(description="Special notes or tips for this activity")


class DayPlan(BaseModel):
    date: str = Field(description="Date (e.g., 'Saturday, Dec 15')")
    weather_summary: str = Field(description="Weather summary for the day")
    schedule: List[ScheduledActivity] = Field(description="Scheduled activities for the day")
    meal_suggestions: List[str] = Field(description="Meal timing and suggestions")
    backup_plan: str = Field(description="Alternative plan if weather changes")


class StructuredWeekendPlan(BaseModel):
    destination: str = Field(description="Destination city/location")
    dates: List[str] = Field(description="Weekend dates")
    day_by_day: List[DayPlan] = Field(description="Day-by-day plans")
    total_estimated_cost: int = Field(description="Total estimated cost in USD")
    packing_essentials: List[str] = Field(description="Essential items to pack")
    general_tips: List[str] = Field(description="General tips for the weekend")
    emergency_contacts: str = Field(description="Useful emergency contact information")


class WeekendPlannerRequest(BaseModel):
    """Input format for weekend planner agent requests"""
    destination: str = Field(description="Destination city/location")
    dates: List[str] = Field(description="List of dates (e.g., ['2025-10-20', '2025-10-21'])")
    weather_forecast: dict = Field(description="Weather forecast data from weather agent")
    activities_list: dict = Field(description="Activities recommendations from activities agent")


class WeekendPlannerAgent:
    """
    Weekend planning agent powered by Google ADK and Gemini.

    This agent creates comprehensive weekend itineraries by synthesizing weather
    forecasts and activity recommendations. It uses the A2A Protocol to receive
    structured inputs and returns well-organized day-by-day plans.

    The agent uses Google's Gemini model to create cohesive weekend plans that
    balance activities, weather considerations, and travel logistics.

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
            name='weekend_planner_agent',
            description='An agent that synthesizes weather and activities into a cohesive weekend plan',
            instruction="""
You are a weekend planning agent that creates comprehensive, well-organized weekend itineraries.
Your role is to take weather forecasts and activity recommendations and organize them into a
practical, enjoyable weekend schedule.

You will receive:
- Destination and dates
- Weather forecast data (with daily conditions)
- Activities list (with timing, duration, indoor/outdoor info)

Return ONLY a valid JSON object with this exact structure:
{
  "destination": "City Name",
  "dates": ["Date 1", "Date 2"],
  "day_by_day": [
    {
      "date": "Saturday, Dec 15",
      "weather_summary": "Sunny, 75°F high, 60°F low",
      "schedule": [
        {
          "time": "9:00 AM - 11:00 AM",
          "activity_name": "Activity Name",
          "location": "Location",
          "duration_minutes": 120,
          "notes": "Special notes or tips"
        }
      ],
      "meal_suggestions": ["Breakfast at 8 AM near hotel", "Lunch at 12:30 PM in downtown"],
      "backup_plan": "If it rains, switch to indoor museums"
    }
  ],
  "total_estimated_cost": 250,
  "packing_essentials": ["Item 1", "Item 2", "Item 3"],
  "general_tips": ["Tip 1", "Tip 2", "Tip 3"],
  "emergency_contacts": "Local emergency: 911, Tourist info: ..."
}

Guidelines:
- Schedule activities logically (morning outdoor activities before afternoon heat)
- Group activities by location to minimize travel time
- Include buffer time between activities (15-30 min)
- Match activity scheduling to weather (outdoor when sunny, indoor when rainy)
- Suggest meal times between activities
- Create realistic daily schedules (don't over-pack)
- Include practical packing suggestions based on weather
- Provide backup plans for weather changes
- Add helpful local tips and emergency contacts

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
            validated_plan = StructuredWeekendPlan(**structured_data)
            final_response = json.dumps(validated_plan.model_dump(), indent=2)
            print("✅ Successfully created structured weekend plan")
            return final_response
        except json.JSONDecodeError as e:
            print(f"❌ JSON parsing error: {e}")
            print(f"Content: {content_str}")
            return json.dumps({
                "error": "Failed to generate structured weekend plan",
                "raw_content": content_str[:200]
            })
        except Exception as e:
            print(f"❌ Validation error: {e}")
            return json.dumps({
                "error": f"Validation failed: {str(e)}"
            })


# Build the A2A Starlette app
base_url = os.getenv("WEEKEND_PLANNER_PUBLIC_URL")

skill = AgentSkill(
    id='weekend_planner_agent',
    name='Weekend Planner Agent',
    description='Synthesizes weather and activities into comprehensive weekend plans using ADK. Expects JSON input with destination, dates, weather_forecast, and activities_list fields.',
    tags=['travel', 'planning', 'itinerary', 'scheduling', 'adk'],
    examples=[
        '{"destination": "San Francisco", "dates": ["2025-10-20", "2025-10-21"], "weather_forecast": {"forecast": [{"day": 1, "condition": "Sunny", "highTemp": 72}]}, "activities_list": {"activities": [{"name": "Golden Gate Bridge", "duration_minutes": 120}]}}',
        '{"destination": "New York", "dates": ["2025-11-15", "2025-11-16"], "weather_forecast": {"forecast": [{"day": 1, "condition": "Cloudy", "highTemp": 55}]}, "activities_list": {"activities": [{"name": "Central Park", "duration_minutes": 180}]}}',
        '{"destination": "Seattle", "dates": ["2025-12-01", "2025-12-02"], "weather_forecast": {"forecast": [{"day": 1, "condition": "Rainy", "highTemp": 50}]}, "activities_list": {"activities": [{"name": "Pike Place Market", "duration_minutes": 90}]}}'
    ],
)

public_agent_card = AgentCard(
    name='Weekend Planner Agent',
    description='ADK-powered agent that creates comprehensive weekend itineraries from weather and activity data',
    url=base_url or "",
    version="1.0.0",
    defaultInputModes=["text"],
    defaultOutputModes=["text"],
    capabilities=AgentCapabilities(streaming=True),
    skills=[skill],
    supportsAuthenticatedExtendedCard=False,
)

class WeekendPlannerAgentExecutor(AgentExecutor):
    def __init__(self):
        self.agent = WeekendPlannerAgent()

    async def execute(
        self,
        context: RequestContext,
        event_queue: EventQueue,
    ) -> None:
        try:
            # Parse and validate JSON input
            raw_input = context.get_user_input()
            input_data = json.loads(raw_input)
            planner_request = WeekendPlannerRequest(**input_data)

            # Format structured request into prompt for ADK agent
            dates_str = ", ".join(planner_request.dates)
            weather_str = json.dumps(planner_request.weather_forecast, indent=2)
            activities_str = json.dumps(planner_request.activities_list, indent=2)

            query = f"""Create a comprehensive weekend plan for {planner_request.destination} for: {dates_str}

Weather Forecast:
{weather_str}

Recommended Activities:
{activities_str}

Please organize these into a well-structured day-by-day itinerary with timing, meals, and practical tips."""

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
                    "activities_list": "object"
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
                    "activities_list": "object"
                }
            })
            await event_queue.enqueue_event(new_agent_text_message(error_msg))

    async def cancel(
        self, context: RequestContext, event_queue: EventQueue
    ) -> None:
        raise Exception('cancel not supported')

request_handler = DefaultRequestHandler(
    agent_executor=WeekendPlannerAgentExecutor(),
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
    port = int(os.getenv("WEEKEND_PLANNER_PORT", 9007))
    print(f"📅 Starting Weekend Planner Agent on http://localhost:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
