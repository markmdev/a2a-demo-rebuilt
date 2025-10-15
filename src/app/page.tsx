"use client";

/**
 * Main Chat Page with A2A Visualization
 *
 * This is the primary interface for demonstrating Agent-to-Agent communication.
 * Features:
 * - Split panel layout: Chat (left) + Content visualization (right)
 * - A2A message flow visualization (orchestrator ↔ agents)
 * - Dynamic card rendering for structured agent responses
 * - Integration with CopilotKit for agent communication
 */

import React, { useState, useEffect } from "react";
import { CopilotChat } from "@copilotkit/react-ui";
import { useCopilotChat, useCopilotAction, ActionRenderProps } from "@copilotkit/react-core";
import { MessageToA2A } from "@/components/a2a/MessageToA2A";
import { MessageFromA2A } from "@/components/a2a/MessageFromA2A";
import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";
import { Message } from '@copilotkit/shared';

/**
 * Type for the send_message_to_a2a_agent action parameters
 * Properly typed using CopilotKit's ActionRenderProps
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
 * ChatInner Component
 *
 * Internal component that uses CopilotKit hooks to:
 * 1. Register A2A action for message visualization
 * 2. Extract structured data from agent responses
 * 3. Update parent state when new data arrives
 */
const ChatInner: React.FC = () => {
  const { visibleMessages } = useCopilotChat({
    initialMessages: [
      {
        id: "1",
        role: "user",
        content: "Hello! My name is Mark"
      },
      {
        id: "2",
        role: "assistant",
        content: "Hi! I will remember that"
      }
    ]
  });

  console.log("Messages on mount:", visibleMessages);
  const pathname = usePathname();

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

  return (
    <>
      <Sidebar currentPath={pathname} />
      {/* Left Panel: Chat Interface */}
      <div className="w-full border-2 border-white bg-white/50 backdrop-blur-md shadow-elevation-lg flex flex-col rounded-lg overflow-hidden">
        {/* Chat Header */}
        <div className="p-6 border-b border-[#DBDBE5]">
          <h1 className="text-2xl font-semibold text-[#010507] mb-1">
            A2A Communication Demo
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
    </>
  );
};

/**
 * Main Page Component
 *
 * Renders the complete page layout with gradient backgrounds and the chat interface.
 * The CopilotKit provider is in the root layout, so this component focuses on
 * the visual structure and chat functionality.
 */
export default function HomePage() {
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

      {/* Main Content (Split Layout) */}
      <div className="flex flex-1 overflow-hidden z-10 gap-2">
        <ChatInner />
      </div>
    </div>
  );
}
