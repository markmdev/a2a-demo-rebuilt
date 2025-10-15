"use client";

/**
 * Conversations Page with Three-Column Layout
 *
 * Layout structure:
 * [Nav Sidebar 280px] [Conversation List 300px] [Chat Area flex-1]
 *
 * Features:
 * - Multiple conversation support
 * - Create new conversations
 * - Switch between conversations (isolated message history)
 * - A2A message flow visualization
 */

import React from "react";
import { CopilotChat } from "@copilotkit/react-ui";
import { useCopilotAction, ActionRenderProps } from "@copilotkit/react-core";
import { MessageToA2A } from "@/components/a2a/MessageToA2A";
import { MessageFromA2A } from "@/components/a2a/MessageFromA2A";
import Sidebar from "@/components/Sidebar";
import ConversationList from "@/components/ConversationList";
import { usePathname } from "next/navigation";
import { useConversation } from "@/lib/contexts/ConversationContext";

/**
 * Type for the send_message_to_a2a_agent action parameters
 */
type MessageActionRenderProps = ActionRenderProps<
  [
    {
      readonly name: "agentName";
      readonly type: "string";
      readonly description: "The name of the A2A agent to send the message to";
    },
    {
      readonly name: "task";
      readonly type: "string";
      readonly description: "The task or message to send to the A2A agent";
    }
  ]
>;

/**
 * ChatArea Component
 *
 * Displays the chat interface when a conversation is active,
 * or a placeholder when no conversation is selected.
 */
const ChatArea: React.FC = () => {
  const { getActiveConversation } = useConversation();
  const activeConversation = getActiveConversation();

  // Register A2A message visualizer (renders green/blue communication boxes)
  useCopilotAction({
    name: "send_message_to_a2a_agent",
    description: "Sends a message to an A2A agent for processing",
    available: "frontend",
    parameters: [
      {
        name: "agentName",
        type: "string",
        description: "The name of the A2A agent to send the message to",
      },
      {
        name: "task",
        type: "string",
        description: "The task or message to send to the A2A agent",
      },
    ],
    render: (actionRenderProps: MessageActionRenderProps) => {
      return (
        <>
          <MessageToA2A {...actionRenderProps} />
          <MessageFromA2A {...actionRenderProps} />
        </>
      );
    },
  });

  if (!activeConversation) {
    return (
      <div className="w-full border-2 border-white bg-white/50 backdrop-blur-md shadow-elevation-lg flex flex-col items-center justify-center rounded-lg overflow-hidden">
        <div className="text-center p-12">
          <svg
            className="w-20 h-20 mx-auto mb-6 text-[#DBDBE5]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <h2 className="text-2xl font-semibold text-[#010507] mb-2">
            No Conversation Selected
          </h2>
          <p className="text-[#57575B]">
            Select a conversation from the list or create a new one to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full border-2 border-white bg-white/50 backdrop-blur-md shadow-elevation-lg flex flex-col rounded-lg overflow-hidden">
      {/* Chat Header */}
      <div className="p-6 border-b border-[#DBDBE5]">
        <h1 className="text-2xl font-semibold text-[#010507] mb-1">
          {activeConversation.name}
        </h1>
        <p className="text-sm text-[#57575B] leading-relaxed">
          Multi-Agent demonstration with{" "}
          <span className="text-[#6366f1] font-semibold">ADK agents</span>
        </p>
        <p className="text-xs text-[#838389] mt-1">
          Orchestrator-mediated A2A Protocol
        </p>
      </div>

      {/* Chat Component */}
      <div className="overflow-hidden">
        <CopilotChat
          className="h-full"
          labels={{
            initial:
              "👋 Hi! I'm your A2A demo assistant.\n\nI coordinate with specialized agents to help you explore Agent-to-Agent communication. Try asking me:\n- 'Create a budget for a 5-day trip'\n- 'Show me the weather forecast for Paris'\n- 'Help me plan a vacation'",
          }}
          instructions="You are a helpful orchestrator assistant that coordinates with specialized agents using A2A protocol. When users ask for information, delegate to appropriate agents like Budget Agent or Weather Agent using the send_message_to_a2a_agent action."
        />
      </div>
    </div>
  );
};

/**
 * Main Conversations Page Component
 */
export default function ConversationsPage() {
  const pathname = usePathname();

  return (
    <div className="relative flex h-screen overflow-hidden bg-[#DEDEE9] p-2">
      {/* Gradient Background Orbs */}
      <div
        className="absolute w-[445.84px] h-[445.84px] left-[1040px] top-[11px] rounded-full z-0"
        style={{ background: "rgba(255, 172, 77, 0.2)", filter: "blur(103.196px)" }}
      />
      <div
        className="absolute w-[609.35px] h-[609.35px] left-[1338.97px] top-[624.5px] rounded-full z-0"
        style={{ background: "#C9C9DA", filter: "blur(103.196px)" }}
      />
      <div
        className="absolute w-[609.35px] h-[609.35px] left-[670px] top-[-365px] rounded-full z-0"
        style={{ background: "#C9C9DA", filter: "blur(103.196px)" }}
      />
      <div
        className="absolute w-[609.35px] h-[609.35px] left-[507.87px] top-[702.14px] rounded-full z-0"
        style={{ background: "#F3F3FC", filter: "blur(103.196px)" }}
      />
      <div
        className="absolute w-[445.84px] h-[445.84px] left-[127.91px] top-[331px] rounded-full z-0"
        style={{ background: "rgba(255, 243, 136, 0.3)", filter: "blur(103.196px)" }}
      />
      <div
        className="absolute w-[445.84px] h-[445.84px] left-[-205px] top-[802.72px] rounded-full z-0"
        style={{ background: "rgba(255, 172, 77, 0.2)", filter: "blur(103.196px)" }}
      />

      {/* Three-Column Layout */}
      <div className="flex flex-1 overflow-hidden z-10 gap-2">
        {/* Column 1: Navigation Sidebar */}
        <Sidebar currentPath={pathname} />

        {/* Column 2: Conversation List */}
        <ConversationList />

        {/* Column 3: Chat Area */}
        <ChatArea />
      </div>
    </div>
  );
}
