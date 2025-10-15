# A2A Demo Agents

This directory contains the Python agents for the A2A demo application.

## Agents

### 1. Orchestrator Agent (`orchestrator.py`)
- **Port:** 9000
- **Model:** Gemini 2.0 Flash
- **Protocol:** AG-UI
- **Purpose:** Main host agent that handles user conversations

### 2. Budget Agent (`budget_agent.py`)
- **Port:** 9001
- **Model:** Gemini 2.0 Flash
- **Protocol:** AG-UI
- **Purpose:** Generates detailed travel budget breakdowns with structured JSON output

### 3. Weather Agent (`weather_agent.py`)
- **Port:** 9002
- **Model:** Gemini 2.0 Flash
- **Protocol:** AG-UI
- **Purpose:** Provides weather forecasts for travel destinations with daily breakdowns and travel advice

## Setup

### 1. Install Dependencies

The virtual environment is located at `../venv` (parent directory):

```bash
cd ..
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r agents/requirements.txt
```

### 2. Configure API Key

Create a `.env` file in the `agents/` directory:

```bash
cd agents
cat > .env << EOF
GOOGLE_API_KEY=your_api_key_here
EOF
```

Get your API key from: https://aistudio.google.com/app/apikey

## Running the Agents

### Run from parent directory (rebuilt_app):

```bash
# Start orchestrator agent
cd /path/to/rebuilt_app
.venv/bin/python agents/orchestrator.py

# Start budget agent (in another terminal)
cd /path/to/rebuilt_app
.venv/bin/python agents/budget_agent.py

# Start weather agent (in another terminal)
cd /path/to/rebuilt_app
.venv/bin/python agents/weather_agent.py
```

### Using the shell scripts:

```bash
# Make executable (first time only)
chmod +x agents/run_budget_agent.sh
chmod +x agents/run_weather_agent.sh

# Run the budget agent
./agents/run_budget_agent.sh

# Run the weather agent (in another terminal)
./agents/run_weather_agent.sh
```

## Testing

### Test the Budget Agent

Test the budget agent with curl:

```bash
curl -X POST http://localhost:9001/ \
  -H "Content-Type: application/json" \
  -d '{
    "threadId": "test-thread",
    "runId": "test-run",
    "messages": [{
      "id": "msg-1",
      "role": "user",
      "content": "Create a budget for a 5-day trip to Tokyo for 2 people, comfort level"
    }],
    "tools": [],
    "context": [],
    "forwardedProps": {},
    "state": {}
  }'
```

### Test the Weather Agent

Test the weather agent with curl:

```bash
curl -X POST http://localhost:9002/ \
  -H "Content-Type: application/json" \
  -d '{
    "threadId": "test-thread",
    "runId": "test-run",
    "messages": [{
      "id": "msg-1",
      "role": "user",
      "content": "What is the weather forecast for Tokyo next week?"
    }],
    "tools": [],
    "context": [],
    "forwardedProps": {},
    "state": {}
  }'
```

## Important Notes

### Virtual Environment Location

The `.venv` directory MUST be in the parent directory (`rebuilt_app/`), not inside `agents/`.

This is because Google ADK checks that the app name matches the directory structure where the agent code is loaded from. Having `.venv` inside `agents/` causes an app name mismatch error.

**Correct structure:**
```
rebuilt_app/
├── .venv/           ← Virtual environment here
├── agents/
│   ├── orchestrator.py
│   ├── budget_agent.py
│   ├── requirements.txt
│   └── .env
```

**Incorrect structure (will cause errors):**
```
rebuilt_app/
├── agents/
│   ├── .venv/      ← DON'T put it here!
│   ├── orchestrator.py
│   └── budget_agent.py
```

### Environment Variables

- `GOOGLE_API_KEY` - Required for Gemini models
- `ORCHESTRATOR_PORT` - Port for orchestrator (default: 9000)
- `BUDGET_AGENT_PORT` - Port for budget agent (default: 9001)
- `WEATHER_AGENT_PORT` - Port for weather agent (default: 9002)

## Development

### Adding New Agents

1. Create a new Python file in this directory
2. Follow the pattern in `budget_agent.py` or `orchestrator.py`
3. Use `ADKAgent` wrapper with `add_adk_fastapi_endpoint`
4. Choose a unique port number
5. Add environment variable for the port (optional)
6. Update this README

### Budget Agent Output Format

The budget agent returns structured JSON:

```json
{
  "totalBudget": 3500.00,
  "currency": "USD",
  "breakdown": [
    {
      "category": "Hotels",
      "amount": 1200.00,
      "description": "Mid-range hotel for 5 nights"
    },
    {
      "category": "Flights",
      "amount": 800.00,
      "description": "Round-trip airfare"
    },
    ...
  ],
  "destination": "Tokyo, Japan",
  "notes": "Book flights 2-3 months in advance for best prices..."
}
```

### Weather Agent Output Format

The weather agent returns structured JSON:

```json
{
  "destination": "Tokyo, Japan",
  "forecast": [
    {
      "date": "2025-10-20",
      "condition": "Partly Cloudy",
      "temperature": {
        "high": 68,
        "low": 54,
        "unit": "F"
      },
      "precipitation": 20,
      "humidity": 65,
      "windSpeed": 8,
      "description": "Pleasant weather with mild temperatures"
    },
    {
      "date": "2025-10-21",
      "condition": "Sunny",
      "temperature": {
        "high": 72,
        "low": 56,
        "unit": "F"
      },
      "precipitation": 10,
      "humidity": 60,
      "windSpeed": 6,
      "description": "Clear skies, perfect for sightseeing"
    }
  ],
  "travelAdvice": "Pack light layers as temperatures are mild. Bring a light jacket for evenings. Sun protection recommended for sunny days.",
  "bestDays": [1, 3, 5]
}
```

## Troubleshooting

### "App name mismatch detected"
- **Cause:** `.venv` is in the wrong location
- **Solution:** Move `.venv` to `rebuilt_app/` directory (parent of `agents/`)

### "Missing key inputs argument"
- **Cause:** `GOOGLE_API_KEY` not set
- **Solution:** Create `.env` file in `agents/` directory with your API key

### "Address already in use"
- **Cause:** Port is already occupied
- **Solution:** Kill the process: `lsof -ti:9001 | xargs kill -9`

### Import errors
- **Cause:** Virtual environment not activated or dependencies not installed
- **Solution:** Run from parent directory with `.venv/bin/python`
