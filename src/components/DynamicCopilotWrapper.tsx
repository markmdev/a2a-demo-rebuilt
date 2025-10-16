"use client";

import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const { conversations } = useConversation();

  // Extract conversation ID from pathname
  const conversationId = pathname.startsWith("/conversations/")
    ? pathname.split("/")[2]
    : null;

  // Find the active conversation
  const activeConversation = conversationId
    ? conversations.find((c) => c.id === conversationId)
    : undefined;

  // Use the conversation's threadId, or fall back to default
  const threadId = activeConversation?.threadId || "default_thread";

  return (
    <CopilotKit
      key={threadId} // Force re-mount when threadId changes
      runtimeUrl="/api/copilotkit"
      agent="orchestrator"
      threadId={threadId}
      showDevConsole={true}
      publicLicenseKey={process.env.NEXT_PUBLIC_COPILOTKIT_LICENSE_KEY}
    >
      {children}
    </CopilotKit>
  );
}
