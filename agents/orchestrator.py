"""
Orchestrator Agent (ADK + AG-UI Protocol)

This is the main host agent that handles all user conversations.
It uses Google ADK with Gemini models and exposes an AG-UI Protocol endpoint.

This agent serves as the primary interface for the A2A demo, managing:
- User message handling
- Conversation state
- File uploads and artifacts
- Multi-turn conversations
"""

from __future__ import annotations

from dotenv import load_dotenv
load_dotenv()

import os
import uvicorn
from fastapi import FastAPI
from ag_ui_adk import ADKAgent, add_adk_fastapi_endpoint
from google.adk.agents import LlmAgent
from datetime import date

today = date.today()
formatted_date = today.strftime("%Y-%m-%d")
# Create the main orchestrator agent

orchestrator_agent = LlmAgent(
    name="OrchestratorAgent",
    model="gemini-2.5-flash",
    instruction=f"""
    You are a helpful AI assistant powering an A2A (Agent-to-Agent) communication demo.

    Your role is to:
    1. Help users understand the A2A protocol and how agents communicate
    2. Demonstrate various agent capabilities

    Be friendly, informative, and demonstrate the power of agent-to-agent communication.
    When users ask about agents, explain how the A2A protocol enables different AI systems
    to work together seamlessly. 
    When calling specialized agents, if you lack some information from the user - use any information, or try your best to guess it from the context. Don't ask the user clarifying questions.
    Today is {formatted_date}
    """,
)

# Expose the agent via AG-UI Protocol
adk_orchestrator_agent = ADKAgent(
    adk_agent=orchestrator_agent,
    app_name="orchestrator_app",
    user_id="demo_user",
    session_timeout_seconds=3600,
    use_in_memory_services=True  # Use in-memory storage for demo
)

# Create FastAPI app
app = FastAPI(title="A2A Demo Orchestrator Agent (ADK)")

# Add the ADK agent endpoint
add_adk_fastapi_endpoint(app, adk_orchestrator_agent, path="/")

if __name__ == "__main__":
    port = int(os.getenv("ORCHESTRATOR_PORT", 9000))
    print(f"🤖 Starting Orchestrator Agent on http://localhost:{port}")
    print(f"   Model: gemini-2.0-flash-exp")
    print(f"   Protocol: AG-UI + A2A")
    uvicorn.run(app, host="0.0.0.0", port=port)
