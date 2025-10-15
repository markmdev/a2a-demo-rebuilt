# A2A Demo - Agent-to-Agent Communication

A demonstration of the **A2A (Agent-to-Agent) Protocol** using **AG-UI**, **CopilotKit**, and **Google ADK**. This application showcases how agents can communicate seamlessly through standardized protocols.

![A2A Demo Screenshot](demo.png)

## What This Demonstrates

This demo rebuilds Google's original A2A UI using modern AG-UI CopilotKit patterns, featuring:

- **AG-UI Protocol**: Standardized agent-UI communication
- **A2A Protocol**: Agent-to-agent messaging and coordination
- **Google ADK Integration**: Using Gemini models for agent capabilities
- **Modern UI**: Glass-morphism design with beautiful animations
- **Real-time Communication**: WebSocket-based streaming updates

## Prerequisites

- Node.js 18+
- Python 3.10+
- [Google API Key](https://aistudio.google.com/app/apikey) (for Gemini models)
- npm, pnpm, yarn, or bun package manager

> **Note:** This repository ignores lock files to avoid conflicts between different package managers. Generate your own lock file using your preferred package manager.

## Quick Start

### 1. Install Frontend Dependencies

```bash
npm install
# or pnpm install / yarn install / bun install
```

### 2. Install Python Dependencies

```bash
cd agents
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### 3. Configure Environment

```bash
cp .env.example .env.local
# Edit .env.local and add your GOOGLE_API_KEY
```

### 4. Start the Application

```bash
npm run dev
```

This starts:
- **UI** on `http://localhost:3000`
- **Orchestrator Agent** on `http://localhost:9000`

## Available Scripts

- `npm run dev` - Start both UI and agent servers
- `npm run dev:ui` - Start only the Next.js UI
- `npm run dev:agents` - Start only the Python agents
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run install:agents` - Set up Python environment

## Project Structure

```
rebuilt_app/
├── src/
│   ├── app/
│   │   ├── api/copilotkit/    # AG-UI endpoint
│   │   ├── page.tsx            # Main chat interface
│   │   └── layout.tsx          # Root layout
│   ├── components/             # React components
│   ├── lib/                    # Utilities
│   └── types/                  # TypeScript types
├── agents/
│   ├── orchestrator.py         # Main ADK agent
│   └── requirements.txt        # Python dependencies
└── REBUILD_PLAN.md            # Development checklist
```

## Architecture

```
┌─────────────────────────────────────┐
│ Next.js UI (CopilotKit)            │
│ - Chat interface                    │
│ - Navigation                        │
│ - Real-time updates                 │
└────────────┬────────────────────────┘
             │ AG-UI Protocol
┌────────────┴────────────────────────┐
│ AG-UI Endpoint                      │
│ - HTTP Agent connection             │
└────────────┬────────────────────────┘
             │
┌────────────┴────────────────────────┐
│ Orchestrator Agent (ADK)            │
│ - Gemini 2.0 Flash                  │
│ - Conversation management           │
│ - A2A coordination                  │
└─────────────────────────────────────┘
```

## Key Features

### 1. Modern UI Design
- Glass-morphism effects with backdrop blur
- Beautiful gradient backgrounds
- Smooth animations and transitions
- Responsive layout

### 2. A2A Protocol Integration
- Agent-to-agent communication
- Message routing and coordination
- Task management
- Event streaming

### 3. Conversation Management
- Create and manage conversations
- View message history
- Track agent interactions
- Monitor tasks and events

## Technologies

- **Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS
- **Agent Framework**: Google ADK with Gemini models
- **Protocols**: AG-UI Protocol, A2A Protocol
- **Integration**: CopilotKit for seamless UI-agent communication

## Documentation

- [AG-UI Protocol](https://docs.ag-ui.com)
- [A2A Protocol](https://github.com/agent-matrix/a2a)
- [Google ADK](https://google.github.io/adk-docs/)
- [CopilotKit](https://docs.copilotkit.ai)

## Troubleshooting

**Agent not connecting?**
- Verify the orchestrator is running on port 9000
- Check your GOOGLE_API_KEY in .env.local
- Ensure Python dependencies are installed

**UI not loading?**
- Make sure you ran `npm install`
- Check that port 3000 is available
- Verify Next.js is running without errors

**Python errors?**
- Activate the virtual environment: `source agents/.venv/bin/activate`
- Reinstall dependencies: `pip install -r agents/requirements.txt`

## License

MIT
