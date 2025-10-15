/**
 * Individual Conversation Page
 *
 * Server Component that fetches conversation and messages before rendering.
 * This eliminates race conditions by ensuring data is ready before ChatArea mounts.
 *
 * Layout: Split view with Chat (left) and Events (right)
 */

import { notFound } from "next/navigation";
import { conversationStore } from "@/lib/conversationStore";
import ChatArea from "../components/ChatArea";
import EventPanel from "../components/EventPanel";

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

  // Render split view: ChatArea (left) + EventPanel (right)
  return (
    <div className="grid grid-cols-[1fr_400px] gap-2 w-full h-full">
      {/* Left: Chat Area (takes remaining space, constrained by grid) */}
      <div className="min-w-0 overflow-hidden h-screen">
        <ChatArea
          conversation={conversation}
          initialMessages={messages}
        />
      </div>

      {/* Right: Event Panel (fixed 400px by grid) */}
      <div className="h-screen">
        <EventPanel conversationId={id} />
      </div>
    </div>
  );
}
