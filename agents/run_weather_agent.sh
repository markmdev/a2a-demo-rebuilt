#!/bin/bash
# Run the Weather Agent from the parent directory
# This ensures proper module resolution for ADK

cd "$(dirname "$0")/.."
.venv/bin/python agents/weather_agent.py
