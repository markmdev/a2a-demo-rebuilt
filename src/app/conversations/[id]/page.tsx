/**
 * Individual Conversation Page
 *
 * Server Component that fetches conversation and messages before rendering.
 * This eliminates race conditions by ensuring data is ready before ChatArea mounts.
 */

import { notFound } from "next/navigation";
import { conversationStore } from "@/lib/conversationStore";
import ChatArea from "../components/ChatArea";

interface ConversationPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Server Component - fetches conversation and messages server-side
 */
export default async function ConversationPage({ params }: ConversationPageProps) {
  const { id } = await params;

  // Fetch conversation from store
  const conversation = conversationStore.get(id);

  // Return 404 if conversation doesn't exist
  if (!conversation) {
    notFound();
  }

  // Fetch messages for this conversation
  const messages = conversationStore.getMessages(id);

  // Render ChatArea with fetched data
  // Component will mount with all data ready - no race conditions
  return (
    <ChatArea
      conversation={conversation}
      initialMessages={messages}
    />
  );
}
