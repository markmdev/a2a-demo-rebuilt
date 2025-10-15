"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { useConversation } from "@/lib/contexts/ConversationContext";

interface DynamicCopilotWrapperProps {
  children: React.ReactNode;
}

/**
 * DynamicCopilotWrapper
 *
 * Wraps CopilotKit with dynamic threadId based on active conversation.
 * Uses key={threadId} to force re-mount when conversation changes,
 * ensuring message history is properly isolated per conversation.
 *
 * Falls back to a default threadId when no conversation is active.
 */
export default function DynamicCopilotWrapper({ children }: DynamicCopilotWrapperProps) {
  const { getActiveConversation } = useConversation();
  const activeConversation = getActiveConversation();

  // Use the conversation's threadId, or fall back to default
  const threadId = activeConversation?.threadId || "default_thread";

  return (
    <CopilotKit
      key={threadId} // Force re-mount when threadId changes
      runtimeUrl="/api/copilotkit"
      agent="orchestrator"
      threadId={threadId}
      showDevConsole={true}
    >
      {children}
    </CopilotKit>
  );
}
