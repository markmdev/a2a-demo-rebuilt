"use client";

import React, { useEffect, useRef } from "react";
import { CopilotChat } from "@copilotkit/react-ui";
import { useCopilotAction, useCopilotChat, ActionRenderProps } from "@copilotkit/react-core";
import { MessageToA2A } from "@/components/a2a/MessageToA2A";
import { MessageFromA2A } from "@/components/a2a/MessageFromA2A";
import { useConversation } from "@/lib/contexts/ConversationContext";
import { useEvents } from "@/lib/contexts/EventContext";
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
    const { logUserMessage, logAssistantMessage, updateAssistantMessage } = useEvents();

    // Track saved messages by ID -> content for detecting changes
    const savedMessagesRef = useRef<Map<string, string>>(new Map());

    // Track message IDs to event IDs (for updating events instead of creating duplicates)
    const messageEventIdsRef = useRef<Map<string, string>>(new Map());

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
      // Process messages sequentially to avoid race conditions
      const syncMessages = async () => {
        for (const msg of visibleMessages) {
          // Only process TextMessages (which have content property)
          if (!msg.isTextMessage()) {
            continue;
          }

          const lastSavedContent = savedMessagesRef.current.get(msg.id);

          // Save if: (1) new message OR (2) content changed (streaming update)
          if (lastSavedContent !== msg.content) {
            // Skip empty assistant messages (streaming placeholders that get replaced)
            if (msg.role === "assistant" && msg.content === "") {
              continue;
            }

            const message: Message = {
              id: msg.id,
              role: msg.role as "user" | "assistant",
              content: msg.content,
            };

            await upsertMessage(conversation.id, message);
            savedMessagesRef.current.set(msg.id, msg.content);

            // Log or update events
            if (msg.content.trim()) {
              if (msg.role === "user") {
                // User messages are logged once (they don't stream)
                if (!messageEventIdsRef.current.has(msg.id)) {
                  const eventId = await logUserMessage(conversation.id, msg.id, msg.content);
                  if (eventId) {
                    messageEventIdsRef.current.set(msg.id, eventId);
                  }
                }
              } else if (msg.role === "assistant") {
                // Assistant messages: create event on first appearance, update on subsequent changes
                const existingEventId = messageEventIdsRef.current.get(msg.id);

                if (existingEventId) {
                  // Update existing event with new content (streaming update)
                  await updateAssistantMessage(conversation.id, existingEventId, msg.content);
                } else {
                  // Create new event for this message
                  const eventId = await logAssistantMessage(conversation.id, msg.id, msg.content);
                  if (eventId) {
                    messageEventIdsRef.current.set(msg.id, eventId);
                  }
                }
              }
            }
          }
        }
      };

      syncMessages();
    }, [visibleMessages, conversation, upsertMessage, logUserMessage, logAssistantMessage, updateAssistantMessage]);

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
            <A2AEventLogger
              conversationId={conversation.id}
              actionRenderProps={actionRenderProps}
            />
            <MessageToA2A {...actionRenderProps} />
            <MessageFromA2A {...actionRenderProps} />
          </>
        );
      },
    });

    return (
      <div className="w-full h-full border-2 border-white bg-white/50 backdrop-blur-md shadow-elevation-lg flex flex-col rounded-lg overflow-hidden">
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
        <div className="flex-1 overflow-y-auto">
          <CopilotChat
            key={conversation.threadId}
            className="h-full"
            labels={{
              initial:
                "👋 Welcome to the A2A Protocol Demo!\n\nI orchestrate specialized agents to demonstrate Agent-to-Agent communication.\n\nTry asking:\n\n• \"Plan my weekend in San Francisco\"\n\n• \"What's the weather like in Tokyo next week?\"\n\n• \"Suggest activities for a rainy day in Paris\"",
            }}
            instructions="You are a helpful orchestrator assistant that coordinates with specialized agents using A2A protocol. When users ask for information, delegate to appropriate agents like Weather Agent, Activities Agent, or Weekend Planner using the send_message_to_a2a_agent action."
          />
        </div>
      </div>
    );
  }

/**
 * A2AEventLogger Component
 *
 * Tracks A2A action status changes and logs events
 * - Logs A2A_CALL when status changes to "executing"
 * - Logs A2A_RESPONSE when status changes to "complete"
 */
function A2AEventLogger({
  conversationId,
  actionRenderProps,
}: {
  conversationId: string;
  actionRenderProps: MessageActionRenderProps;
}) {
  const { logA2ACall, logA2AResponse } = useEvents();
  const previousStatusRef = useRef<string | undefined>(undefined);
  const callStartTimeRef = useRef<number>(0);

  const { args, status, result } = actionRenderProps;
  const agentName = args?.agentName || "Unknown Agent";
  const task = args?.task || "Unknown Task";

  // Generate a stable action ID based on args (for linking call and response)
  const actionId = useRef(`a2a_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    const currentStatus = status;
    const previousStatus = previousStatusRef.current;

    // Log A2A call when status changes to "executing"
    if (currentStatus === "executing" && previousStatus !== "executing") {
      callStartTimeRef.current = Date.now();
      logA2ACall(conversationId, actionId.current, agentName, task);
    }

    // Log A2A response when status changes to "complete"
    if (currentStatus === "complete" && previousStatus !== "complete") {
      const durationMs = Date.now() - callStartTimeRef.current;
      const resultText = typeof result === "string" ? result : JSON.stringify(result || "");
      logA2AResponse(conversationId, actionId.current, agentName, task, resultText, durationMs, "success");
    }

    previousStatusRef.current = currentStatus;
  }, [status, conversationId, agentName, task, result, logA2ACall, logA2AResponse]);

  // This component doesn't render anything visible
  return null;
}