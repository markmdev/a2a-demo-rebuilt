"use client";

import React, { useEffect, useRef } from "react";
import { CopilotChat } from "@copilotkit/react-ui";
import { useCopilotAction, useCopilotChat, ActionRenderProps } from "@copilotkit/react-core";
import { MessageToA2A } from "@/components/a2a/MessageToA2A";
import { MessageFromA2A } from "@/components/a2a/MessageFromA2A";
import { useConversation } from "@/lib/contexts/ConversationContext";
import { Message, Conversation } from "@/types/conversation";

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
 * ChatArea Component Props
 */
interface ChatAreaProps {
  conversation: Conversation;
  initialMessages: Message[];
}

/**
 * ChatArea Component
 *
 * Displays the chat interface when a conversation is active,
 * or a placeholder when no conversation is selected.
 *
 * Receives static initialMessages from parent to ensure proper CopilotKit initialization.
 * Component remounts when conversation changes (via key prop in parent).
 *
 * Manages message syncing:
 * - Receives messages as static initialMessages prop
 * - Tracks messages by ID and content to detect streaming updates
 * - Upserts messages when content changes (handles streaming LLM responses)
 */
export default function ChatArea({ conversation, initialMessages }: ChatAreaProps) {
    const { upsertMessage } = useConversation();

    // Track saved messages by ID -> content for detecting changes
    const savedMessagesRef = useRef<Map<string, string>>(new Map());

    // Use CopilotChat hook with static initialMessages from props
    const { visibleMessages } = useCopilotChat({
      initialMessages,
    });

    // Initialize savedMessagesRef with initial messages on mount
    useEffect(() => {
      const map = new Map<string, string>();
      initialMessages.forEach((msg) => {
        map.set(msg.id, msg.content);
      });
      savedMessagesRef.current = map;
    }, []); // Only on mount

    // Sync messages to server when content changes (detects streaming updates)
    useEffect(() => {
      visibleMessages.forEach(async (msg) => {
        const lastSavedContent = savedMessagesRef.current.get(msg.id);

        // Save if: (1) new message OR (2) content changed (streaming update)
        if (lastSavedContent !== msg.content) {
          // Skip empty assistant messages (streaming placeholders that get replaced)
          if (msg.role === "assistant" && msg.content === "") {
            return;
          }

          const message: Message = {
            id: msg.id,
            role: msg.role as "user" | "assistant",
            content: msg.content,
          };

          await upsertMessage(conversation.id, message);
          savedMessagesRef.current.set(msg.id, msg.content);
        }
      });
    }, [visibleMessages, conversation, upsertMessage]);

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
      <div className="w-full border-2 border-white bg-white/50 backdrop-blur-md shadow-elevation-lg flex flex-col rounded-lg overflow-hidden">
        {/* Chat Header */}
        <div className="p-6 border-b border-[#DBDBE5]">
          <h1 className="text-2xl font-semibold text-[#010507] mb-1">
            {conversation.name}
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
            key={conversation.threadId}
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