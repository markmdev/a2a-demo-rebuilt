/**
 * CopilotKit API Route with A2A Middleware
 *
 * This endpoint connects the frontend to the orchestrator agent and enables
 * Agent-to-Agent (A2A) communication between the orchestrator and specialized agents.
 *
 * ARCHITECTURE:
 * - Frontend (CopilotKit) → A2A Middleware → Orchestrator → A2A Agents
 *
 * KEY CONCEPTS:
 * - AG-UI Protocol: Agent-UI communication (CopilotKit ↔ Orchestrator)
 * - A2A Protocol: Agent-to-agent communication (Orchestrator ↔ Specialized Agents)
 * - A2A Middleware: Injects send_message_to_a2a_agent tool to bridge AG-UI and A2A
 */

import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { HttpAgent } from "@ag-ui/client";
import { A2AMiddlewareAgent } from "@ag-ui/a2a-middleware";
import { NextRequest } from "next/server";
import { getRegisteredAgentUrls } from "@/lib/agentRegistry";

export async function POST(request: NextRequest) {
  // Determine base URL for agent connections

  // STEP 1: Get dynamically registered A2A agent URLs
  // These specialized agents communicate via A2A Protocol
  const agentUrls = getRegisteredAgentUrls();

  // STEP 2: Define orchestrator URL (speaks AG-UI Protocol)
  // The orchestrator coordinates with specialized agents
  const orchestratorUrl = process.env.ORCHESTRATOR_URL || "";

  // STEP 3: Wrap orchestrator with HttpAgent (AG-UI client)
  const orchestrationAgent = new HttpAgent({
    url: orchestratorUrl,
  });

  // STEP 4: Create A2A Middleware Agent
  // This bridges AG-UI and A2A protocols by:
  // 1. Wrapping the orchestrator
  // 2. Registering all A2A agents (dynamically from registry)
  // 3. Injecting send_message_to_a2a_agent tool
  // 4. Routing messages between orchestrator and A2A agents
  const a2aMiddlewareAgent = new A2AMiddlewareAgent({
    description:
      "A2A communication orchestrator coordinating with dynamically registered agents",

    // Register all A2A agents from the dynamic registry
    agentUrls: agentUrls,

    // The orchestrator that will coordinate A2A communication
    orchestrationAgent,

    // The orchestrator agent's instructions are defined in the orchestrator.py file
    // This keeps agent behavior centralized and easier to maintain
    instructions: "You are a helpful assistant"
  });

  // STEP 5: Create CopilotKit Runtime with A2A-enabled agent
  const runtime = new CopilotRuntime({
    agents: {
      orchestrator: a2aMiddlewareAgent, // Must match frontend: <CopilotKit agent="orchestrator">
    },
  });

  // STEP 6: Set up Next.js endpoint handler
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter: new ExperimentalEmptyAdapter(),
    endpoint: "/api/copilotkit",
  });

  return handleRequest(request);
}