/**
 * MessageFromA2A Component
 *
 * Visualizes agent → orchestrator responses as a glass-morphism card
 * showing sender/receiver badges and response confirmation.
 *
 * Design features:
 * - Blue/indigo-themed glass-morphism effect (matches app primary)
 * - Smooth animations on mount
 * - Handles pending and completed states
 * - Optional result data display with JSON formatting
 */

import React from "react";
import { getAgentStyle } from "./agent-styles";

/**
 * Props interface matching CopilotKit's action render pattern
 * Note: CopilotKit uses "inProgress" status, we handle both naming conventions
 */
export interface MessageFromA2AProps {
  args: {
    agentName?: string;
    task?: string;
    [key: string]: any;
  };
  status?: "executing" | "inProgress" | "complete" | "failed";
  result?: any;
}

/**
 * Helper function to format result data for display
 * Handles various data types and formats them nicely
 */
function formatResult(result: any): string {
  if (!result) return "";

  if (typeof result === "string") {
    return result;
  }

  if (typeof result === "object") {
    try {
      return JSON.stringify(result, null, 2);
    } catch {
      return String(result);
    }
  }

  return String(result);
}

/**
 * MessageFromA2A Component
 *
 * Displays incoming responses from A2A agents to the orchestrator.
 * Only renders when the action is complete.
 *
 * The actual structured data/results are typically rendered separately
 * in the main content area. This component focuses on visualizing the
 * communication flow and confirmation.
 *
 * @example
 * ```tsx
 * <MessageFromA2A
 *   args={{ agentName: "Budget Agent" }}
 *   status="complete"
 *   result={{ totalBudget: 5000, currency: "USD" }}
 * />
 * ```
 */
export const MessageFromA2A: React.FC<MessageFromA2AProps> = ({
  status,
  args,
  result,
}) => {
  // Only render for complete state
  switch (status) {
    case "complete":
      break;
    default:
      return null;
  }

  const agentStyle = getAgentStyle(args.agentName);
  const hasResult = result !== undefined && result !== null;

  return (
    <div
      className="my-3 animate-in fade-in slide-in-from-bottom-2 duration-300"
      role="status"
      aria-live="polite"
      aria-label={`Response from ${args.agentName}`}
    >
      {/* Blue/Indigo-themed glass card for incoming responses */}
      <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-md border-2 border-blue-200/50 rounded-xl px-5 py-4 shadow-lg hover:shadow-xl transition-all duration-200">
        <div className="flex items-center gap-4">
          {/* Agent badges with arrow */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Source agent badge */}
            <div className="flex flex-col items-center gap-1">
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 ${agentStyle.bgColor} ${agentStyle.textColor} ${agentStyle.borderColor} flex items-center gap-1.5 shadow-md`}
              >
                <span role="img" aria-label="agent icon">
                  {agentStyle.icon}
                </span>
                <span>{args.agentName || "Unknown Agent"}</span>
              </span>
              {agentStyle.framework && (
                <span className="text-[9px] text-gray-500 font-medium">
                  {agentStyle.framework}
                </span>
              )}
            </div>

            {/* Arrow indicator */}
            <span className="text-blue-400 text-lg font-bold">→</span>

            {/* Orchestrator badge */}
            <div className="flex flex-col items-center gap-1">
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-gray-700 to-gray-600 text-white shadow-md">
                Orchestrator
              </span>
              <span className="text-[9px] text-gray-500 font-medium">ADK</span>
            </div>
          </div>

          {/* Response confirmation */}
          <div className="flex items-center gap-2 flex-1">
            <span className="text-green-600 text-lg" role="img" aria-label="success">
              ✓
            </span>
            <span className="text-sm text-gray-700 font-medium">
              Response received
            </span>

            {/* Optional result indicator */}
            {hasResult && (
              <span className="text-xs text-blue-600 bg-blue-100/50 px-2 py-1 rounded-full">
                Data attached
              </span>
            )}
          </div>
        </div>

        {/* Optional result preview (collapsed by default) */}
        {hasResult && typeof result === "object" && (
          <details className="mt-3 pt-3 border-t border-blue-200/30">
            <summary className="text-xs text-blue-700 font-medium cursor-pointer hover:text-blue-800 transition-colors">
              View response data
            </summary>
            <pre className="mt-2 p-3 bg-white/50 rounded-lg text-xs text-gray-800 overflow-x-auto border border-blue-100 max-w-full">
              {formatResult(result)}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default MessageFromA2A;
