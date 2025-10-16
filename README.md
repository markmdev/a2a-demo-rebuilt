# A2A Demo - Agent-to-Agent Communication

A demonstration of the **A2A (Agent-to-Agent) Protocol** using **CopilotKit (AG-UI)**, **Google ADK**, and **Gemini**. This application showcases how AI agents can communicate seamlessly through standardized protocols.

## What This Demonstrates

This demo shows a multi-agent system where:
- An orchestrator agent (AG-UI Protocol) coordinates with specialized agents
- Specialized agents (A2A Protocol) provide domain-specific capabilities
- The A2A Middleware bridges the two protocols seamlessly
- Real-time event tracking visualizes agent communication

### Features

- **Multi-Agent Architecture**: Orchestrator + 3 specialized agents working together
- **Protocol Bridging**: Seamless communication between AG-UI and A2A protocols
- **Real-Time Visualization**: Watch agents communicate in real-time
- **Event Tracking**: Monitor all A2A calls and responses
- **Modern UI**: Glass-morphism design with smooth animations
- **Dynamic Agent Registration**: Add/remove agents at runtime

## Prerequisites

- **Node.js** 18+ (for the Next.js frontend)
- **Python** 3.10+ (for ADK agents)
- **[Google API Key](https://aistudio.google.com/app/apikey)** (for Gemini models)

## Quick Start

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install Python dependencies
cd agents
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### 2. Configure Environment

```bash
# Copy the example environment files
cp .env.example .env.local
cp agents/.env.example agents/.env

# Edit both files and add your Google API key
# .env.local - for Next.js frontend
# agents/.env - for Python agents
```

Both files need your Google API key:
```bash
GOOGLE_API_KEY=your_google_api_key_here
```

### 3. Start the Application

```bash
# Start all agents and UI (single command)
npm run dev
```

This starts:
- **UI** on `http://localhost:3000`
- **Orchestrator** on `http://localhost:9000` (AG-UI Protocol)
- **Weather Agent** on `http://localhost:9005` (A2A Protocol)
- **Activities Agent** on `http://localhost:9006` (A2A Protocol)
- **Weekend Planner** on `http://localhost:9007` (A2A Protocol)

### 4. Register Agents

1. Open `http://localhost:3000` in your browser
2. Navigate to the "Agents" page
3. Click "Add Agent" and quick-add the three specialized agents
4. Return to "Conversations" and start chatting!

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  Next.js Frontend (React 19)                     │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ CopilotChat Component                                      │ │
│  │ - User sends message                                       │ │
│  │ - Displays assistant responses                             │ │
│  │ - Visualizes A2A calls (green) and responses (blue)       │ │
│  └────────────────────────────────────────────────────────────┘ │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         │ CopilotKit (AG-UI Protocol)
                         │
┌────────────────────────▼─────────────────────────────────────────┐
│     Next.js API Route: /api/copilotkit                           │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ A2AMiddlewareAgent (TypeScript)                            │ │
│  │ - Wraps orchestrator agent                                 │ │
│  │ - Injects "send_message_to_a2a_agent" tool                │ │
│  │ - Routes A2A calls to specialized agents                  │ │
│  │ - Returns results back to orchestrator                     │ │
│  └────────────────────────────────────────────────────────────┘ │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         │ HTTP POST (AG-UI Protocol)
                         │
┌────────────────────────▼─────────────────────────────────────────┐
│   Orchestrator Agent (Python ADK, Port 9000)                     │
│   Model: Gemini 2.5 Flash                                        │
│                                                                   │
│  - Receives user messages via AG-UI Protocol                     │
│  - Determines which specialized agents to call                   │
│  - Uses "send_message_to_a2a_agent" tool                        │
│  - Synthesizes responses for the user                            │
└────────────┬────────────────┬────────────────┬───────────────────┘
             │                │                │
             │ A2A Protocol   │ A2A Protocol   │ A2A Protocol
             │ (JSON/HTTP)    │ (JSON/HTTP)    │ (JSON/HTTP)
             │                │                │
┌────────────▼─────────┐  ┌───▼──────────────┐  ┌─▼──────────────────┐
│  Weather Agent       │  │  Activities      │  │  Weekend Planner   │
│  (Port 9005)         │  │  Agent           │  │  (Port 9007)       │
│                      │  │  (Port 9006)     │  │                    │
│  - Gemini 2.5 Flash  │  │                  │  │  - Gemini 2.5      │
│  - Forecasts for     │  │  - Gemini 2.5    │  │    Flash           │
│    destinations      │  │    Flash         │  │  - Synthesizes     │
│  - Travel advice     │  │  - Suggests      │  │    weather +       │
│  - Best days for     │  │    activities    │  │    activities      │
│    activities        │  │    based on      │  │    into day plans  │
│                      │  │    weather       │  │                    │
└──────────────────────┘  └──────────────────┘  └────────────────────┘
```

## How It Works

### 1. Protocols

**AG-UI Protocol** (Frontend ↔ Orchestrator)
- Used by CopilotKit to communicate with the orchestrator
- Supports streaming responses, tool calls, and conversation state
- Orchestrator speaks AG-UI natively via ADK's FastAPI integration

**A2A Protocol** (Orchestrator ↔ Specialized Agents)
- Standardized JSON-based protocol for agent-to-agent communication
- Each specialized agent exposes an agent card at `/.well-known/agent-card.json`
- Messages are sent as structured JSON with roles and content

### 2. A2A Middleware

The `A2AMiddlewareAgent` is the key innovation:

1. **Wraps** the orchestrator agent
2. **Fetches** agent cards from all registered A2A agents
3. **Injects** the `send_message_to_a2a_agent` tool into the orchestrator's toolkit
4. **Intercepts** tool calls destined for A2A agents
5. **Routes** messages via A2A Protocol
6. **Returns** results back to the orchestrator

This creates a seamless bridge where the orchestrator can call A2A agents as if they were native tools.

### 3. Message Flow

```
User: "Plan my weekend in San Francisco"
  ↓
Orchestrator receives message via AG-UI
  ↓
Orchestrator decides to call Weather Agent
  ↓
A2A Middleware intercepts tool call
  ↓
A2A Middleware routes to Weather Agent (A2A Protocol)
  ↓
Weather Agent returns forecast
  ↓
Orchestrator receives result
  ↓
Orchestrator calls Activities Agent
  ↓
... (similar flow)
  ↓
Orchestrator synthesizes response
  ↓
User sees complete weekend plan
```

## Available Scripts

- `npm run dev` - Start all services (UI + all agents)
- `npm run dev:ui` - Start only the Next.js UI
- `npm run dev:orchestrator` - Start only the orchestrator
- `npm run dev:weather` - Start only the weather agent
- `npm run dev:activities` - Start only the activities agent
- `npm run dev:weekend` - Start only the weekend planner
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Key Technologies

### Frontend
- **Next.js 15** with App Router
- **React 19** with hooks
- **TypeScript** (strict mode)
- **TailwindCSS** for styling
- **CopilotKit** for AG-UI integration

### Backend
- **Google ADK** (Agent Development Kit)
- **Gemini 2.5 Flash** models
- **FastAPI** for serving agents
- **A2A Protocol** for agent communication

## Troubleshooting

### Agents not connecting?
- Verify all agents are running (`npm run dev` should start all)
- Check that ports 9000, 9005, 9006, 9007 are available
- Ensure GOOGLE_API_KEY is set in both `.env.local` AND `agents/.env`
- Check Python virtual environment is activated (`source agents/.venv/bin/activate`)

### UI not loading?
- Make sure you ran `npm install`
- Check that port 3000 is available
- Verify Next.js is running without errors

### Python errors?
- Activate the virtual environment: `source agents/.venv/bin/activate`
- Reinstall dependencies: `pip install -r agents/requirements.txt`
- Verify Python version is 3.10+

### Agents not appearing in the UI?
1. Make sure all agent servers are running
2. Go to the "Agents" page
3. Click "Add Agent" and quick-add each agent
4. Check agent status in the UI

## Learn More

- **[AG-UI Protocol](https://docs.ag-ui.com)** - Agent-UI communication standard
- **[A2A Protocol](https://github.com/agent-matrix/a2a)** - Agent-to-agent communication
- **[Google ADK](https://google.github.io/adk-docs/)** - Agent Development Kit
- **[CopilotKit](https://docs.copilotkit.ai)** - React framework for AI copilots
- **[Next.js](https://nextjs.org/docs)** - React framework
- **[Gemini API](https://ai.google.dev/)** - Google's AI models

## License

MIT
