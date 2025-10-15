/**
 * A2A Message Visualization Components
 *
 * This module exports components for visualizing Agent-to-Agent (A2A)
 * communication in the chat interface.
 *
 * Components:
 * - MessageToA2A: Shows outgoing messages from orchestrator to agents (green-themed)
 * - MessageFromA2A: Shows incoming responses from agents to orchestrator (blue-themed)
 *
 * Utilities:
 * - getAgentStyle: Get styling configuration for agent badges
 * - truncateTask: Helper to truncate long task descriptions
 * - AgentStyle: TypeScript interface for agent styling
 *
 * @example
 * ```tsx
 * import { MessageToA2A, MessageFromA2A } from '@/components/a2a';
 *
 * // In your CopilotKit action renderer
 * <MessageToA2A
 *   args={{ agentName: "Budget Agent", task: "Calculate budget" }}
 *   status="executing"
 * />
 *
 * <MessageFromA2A
 *   args={{ agentName: "Budget Agent" }}
 *   status="complete"
 *   result={{ totalBudget: 5000 }}
 * />
 * ```
 */

export { MessageToA2A } from "./MessageToA2A";
export { MessageFromA2A } from "./MessageFromA2A";
export { getAgentStyle, truncateTask } from "./agent-styles";
export type { AgentStyle } from "./agent-styles";
export type { MessageToA2AProps } from "./MessageToA2A";
export type { MessageFromA2AProps } from "./MessageFromA2A";
