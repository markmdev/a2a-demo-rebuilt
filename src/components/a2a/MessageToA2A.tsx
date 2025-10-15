/**
 * MessageToA2A Component
 *
 * Visualizes orchestrator → agent communication as a glass-morphism card
 * showing sender/receiver badges and task description.
 *
 * Design features:
 * - Green-themed glass-morphism effect (emerald/mint tones)
 * - Smooth animations on mount
 * - Loading state while waiting for response
 * - Responsive layout with proper text wrapping
 */

import React from "react";
import { getAgentStyle, truncateTask } from "./agent-styles";

/**
 * Props interface matching CopilotKit's action render pattern
 * Note: CopilotKit uses "inProgress" status, we map it to "executing" for display
 */
export interface MessageToA2AProps {
  args: {
    agentName?: string;
    task?: string;
    [key: string]: any;
  };
  status?: "executing" | "inProgress" | "complete" | "failed";
  result?: any;
}

/**
 * MessageToA2A Component
 *
 * Displays outgoing messages from the orchestrator to A2A agents.
 * Only renders when the action is executing or complete.
 *
 * @example
 * ```tsx
 * <MessageToA2A
 *   args={{ agentName: "Budget Agent", task: "Calculate trip budget for 5 days" }}
 *   status="executing"
 * />
 * ```
 */
export const MessageToA2A: React.FC<MessageToA2AProps> = ({
  status,
  args,
}) => {
  // Only render for executing/inProgress or complete states
  switch (status) {
    case "executing":
    case "inProgress":
    case "complete":
      break;
    default:
      return null;
  }

  const agentStyle = getAgentStyle(args.agentName);
  const isExecuting = status === "executing" || status === "inProgress";

  return (
    <div
      className="my-3 animate-in fade-in slide-in-from-bottom-2 duration-300"
      role="status"
      aria-live="polite"
      aria-label={`Message to ${args.agentName}: ${args.task}`}
    >
      {/* Green-themed glass card for outgoing messages */}
      <div className="bg-gradient-to-r from-emerald-50/80 to-green-50/80 backdrop-blur-md border-2 border-emerald-200/50 rounded-xl px-5 py-4 shadow-lg hover:shadow-xl transition-all duration-200">
        <div className="flex items-start gap-4">
          {/* Agent badges with arrow */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Orchestrator badge */}
            <div className="flex flex-col items-center gap-1">
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-gray-700 to-gray-600 text-white shadow-md">
                Orchestrator
              </span>
              <span className="text-[9px] text-gray-500 font-medium">ADK</span>
            </div>

            {/* Arrow indicator */}
            <span className="text-emerald-400 text-lg font-bold animate-pulse">
              →
            </span>

            {/* Target agent badge */}
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
          </div>

          {/* Task description */}
          <div className="flex-1 min-w-0 flex items-center gap-3">
            <span
              className="text-gray-800 text-sm font-medium flex-1 break-words leading-relaxed"
              title={args.task}
            >
              {truncateTask(args.task) || "Processing request..."}
            </span>

            {/* Loading indicator for executing state */}
            {isExecuting && (
              <div className="flex-shrink-0 flex items-center gap-2">
                <div className="flex space-x-1">
                  <div
                    className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
                <span className="text-xs text-emerald-600 font-medium">
                  Waiting...
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageToA2A;
