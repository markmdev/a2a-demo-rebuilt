"""
Orchestrator Agent (LangGraph + ChatGPT) – Flexible POST body

Accepts either:
1) { "message": "hi", "user_id": "demo_user" }
2) { "messages": [{"role":"user","content":"hi"}, ...], ... }

Keeps an in-memory conversation per user_id.
"""

from __future__ import annotations

import os
from typing import Any, Dict, List, TypedDict

from dotenv import load_dotenv
load_dotenv()

import uvicorn
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel, Field
from openai import OpenAI

from langgraph.graph import StateGraph, END

# -----------------------------------------------------------------------------
# Config
# -----------------------------------------------------------------------------

MODEL = os.getenv("ORCHESTRATOR_MODEL", "gpt-4o")
DEFAULT_USER_ID = os.getenv("ORCHESTRATOR_USER_ID", "demo_user")
SESSION_TIMEOUT_SECONDS = int(os.getenv("SESSION_TIMEOUT_SECONDS", "3600"))
PORT = int(os.getenv("ORCHESTRATOR_PORT", "9000"))

# -----------------------------------------------------------------------------
# LangGraph State
# -----------------------------------------------------------------------------

class Message(TypedDict):
    role: str
    content: str

class OrchestratorState(TypedDict):
    messages: List[Message]
    metadata: Dict[str, Any]

SYSTEM_INSTRUCTION = """You are a helpful AI assistant powering an A2A (Agent-to-Agent) communication demo.

Your role is to:
1. Help users understand the A2A protocol and how agents communicate
2. Demonstrate various agent capabilities

Be friendly, informative, and demonstrate the power of agent-to-agent communication.
When users ask about agents, explain how the A2A protocol enables different AI systems
to work together seamlessly.
"""

def chatgpt_node(state: OrchestratorState) -> OrchestratorState:
    client = OpenAI()
    msgs = [{"role": "system", "content": SYSTEM_INSTRUCTION}] + state["messages"]

    resp = client.chat.completions.create(
        model=MODEL,
        messages=msgs,
        temperature=0.7,
    )
    assistant_text = resp.choices[0].message.content or ""
    return {
        "messages": state["messages"] + [{"role": "assistant", "content": assistant_text}],
        "metadata": state.get("metadata", {}),
    }

graph = StateGraph(OrchestratorState)
graph.add_node("chatgpt", chatgpt_node)
graph.set_entry_point("chatgpt")
graph.add_edge("chatgpt", END)
orchestrator_graph = graph.compile()

# -----------------------------------------------------------------------------
# In-memory sessions
# -----------------------------------------------------------------------------

class SessionStore:
    def __init__(self):
        self._sessions: Dict[str, Dict[str, Any]] = {}

    def get_session(self, user_id: str) -> OrchestratorState:
        sess = self._sessions.get(user_id)
        if not sess:
            sess = {
                "messages": [],
                "metadata": {"session_timeout_seconds": SESSION_TIMEOUT_SECONDS},
                "last_activity": None,
            }
            self._sessions[user_id] = sess
        return {"messages": sess["messages"], "metadata": sess["metadata"]}

    def update_session(self, user_id: str, state: OrchestratorState):
        if user_id not in self._sessions:
            self._sessions[user_id] = {"messages": [], "metadata": {}, "last_activity": None}
        self._sessions[user_id]["messages"] = state["messages"]
        self._sessions[user_id]["metadata"] = state.get("metadata", {})

SESSION_STORE = SessionStore()

# -----------------------------------------------------------------------------
# FastAPI app
# -----------------------------------------------------------------------------

app = FastAPI(title="A2A Demo Orchestrator Agent (LangGraph + ChatGPT)")

class ChatResponse(BaseModel):
    reply: str
    user_id: str
    model: str = MODEL
    protocol: str = "LangGraph + FastAPI"

@app.get("/")
def health():
    return {
        "status": "ok",
        "app": "A2A Demo Orchestrator Agent (LangGraph + ChatGPT)",
        "model": MODEL,
        "protocol": "LangGraph + FastAPI",
    }

def _extract_user_id(payload: Dict[str, Any]) -> str:
    # Prefer explicit user_id if present, else try thread/run metadata, else default
    uid = payload.get("user_id")
    if isinstance(uid, str) and uid.strip():
        return uid

    # Some frontends put user info under forwardedProps.threadMetadata.userId, etc.
    forwarded = payload.get("forwardedProps") or {}
    thread_meta = forwarded.get("threadMetadata") or {}
    uid2 = thread_meta.get("user_id") or thread_meta.get("userId")
    if isinstance(uid2, str) and uid2.strip():
        return uid2

    return DEFAULT_USER_ID

def _extract_message_text(payload: Dict[str, Any]) -> str:
    # 1) Simple body: { "message": "..." }
    if isinstance(payload.get("message"), str) and payload["message"].strip():
        return payload["message"].strip()

    # 2) Rich body: { "messages": [ {role, content}, ... ] }
    msgs = payload.get("messages")
    if isinstance(msgs, list) and msgs:
        # Find the last "user" role message with string content
        for m in reversed(msgs):
            if isinstance(m, dict) and m.get("role") == "user":
                content = m.get("content")
                if isinstance(content, str) and content.strip():
                    return content.strip()
                # Some frameworks send parts instead of direct content:
                # Try common nested shapes: parts[0].text OR parts[0].root.text
                parts = m.get("parts")
                if isinstance(parts, list) and parts:
                    p0 = parts[0]
                    if isinstance(p0, dict):
                        text = (
                            p0.get("text") or
                            (p0.get("root") or {}).get("text")
                        )
                        if isinstance(text, str) and text.strip():
                            return text.strip()

    # 3) Sometimes the top-level message may be under state/context
    state = payload.get("state") or {}
    if isinstance(state, dict):
        st_msg = state.get("message")
        if isinstance(st_msg, str) and st_msg.strip():
            return st_msg.strip()

    raise HTTPException(status_code=400, detail="Could not extract a user message from request body.")

@app.post("/", response_model=ChatResponse)
async def chat(request: Request):
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY not configured.")

    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON body.")

    user_id = _extract_user_id(payload)
    user_text = _extract_message_text(payload)
    print("User_id: ", user_id)

    # Load session, append user's message, run graph
    state = SESSION_STORE.get_session(user_id)
    state["messages"] = state["messages"] + [{"role": "user", "content": user_text}]
    result = orchestrator_graph.invoke(state)
    SESSION_STORE.update_session(user_id, result)

    reply = result["messages"][-1]["content"] if result["messages"] else ""
    return ChatResponse(reply=reply, user_id=user_id)

# -----------------------------------------------------------------------------
# Entrypoint
# -----------------------------------------------------------------------------

if __name__ == "__main__":
    print(f"🤖 Starting Orchestrator Agent on http://localhost:{PORT}")
    print(f"   Model: {MODEL}")
    print(f"   Protocol: LangGraph + ChatGPT")
    uvicorn.run(app, host="0.0.0.0", port=PORT)
