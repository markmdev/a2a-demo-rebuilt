"use client";

import { useRouter, usePathname } from "next/navigation";
import { useConversation } from "@/lib/contexts/ConversationContext";
import { formatDistanceToNow } from "@/lib/utils";

/**
 * ConversationList Component
 *
 * Sidebar that displays navigation tabs and conversations:
 * - Tabs for switching between Conversations and Agents
 * - "+ New Conversation" button
 * - Scrollable list of conversations
 * - Active conversation highlighted in indigo
 * - Router navigation to switch conversations
 */
export default function ConversationList() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    conversations,
    loading,
    createConversation,
  } = useConversation();

  // Determine active tab based on pathname
  const isConversationsTab = pathname.startsWith("/conversations");
  const isAgentsTab = pathname.startsWith("/agents");

  // Extract active conversation ID from pathname
  const activeConversationId = pathname.startsWith("/conversations/")
    ? pathname.split("/")[2]
    : null;

  const handleCreateConversation = async () => {
    const newConversation = await createConversation();
    if (newConversation) {
      // Navigate to the new conversation
      router.push(`/conversations/${newConversation.id}`);
    }
  };

  const handleSelectConversation = (id: string) => {
    router.push(`/conversations/${id}`);
  };

  return (
    <div className="w-[300px] flex-shrink-0 border-2 border-white bg-white/50 backdrop-blur-md shadow-xl flex flex-col rounded-lg overflow-hidden">
      {/* Navigation Tabs */}
      <div className="p-4 border-b border-[#DBDBE5]">
        <div className="flex gap-1 mb-4">
          <button
            onClick={() => router.push("/conversations")}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-all ${
              isConversationsTab
                ? "bg-[#6366f1] text-white shadow-sm"
                : "text-[#57575B] hover:bg-white/60"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Conversations
          </button>
          <button
            onClick={() => router.push("/agents")}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-all ${
              isAgentsTab
                ? "bg-[#6366f1] text-white shadow-sm"
                : "text-[#57575B] hover:bg-white/60"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Agents
          </button>
        </div>

      {/* Header with New Conversation Button */}
      {isConversationsTab && (
        <div>
          <button
            onClick={handleCreateConversation}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#6366f1] text-white font-medium shadow-sm hover:bg-[#5558e3] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Conversation
          </button>
        </div>
      )}
      </div>

      {/* Conversation List - only show on Conversations tab */}
      {isConversationsTab && (
      <div className="flex-1 overflow-y-auto p-4">
        {loading && conversations.length === 0 ? (
          <div className="text-sm text-[#838389] text-center py-8">
            Loading conversations...
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-sm text-[#838389] text-center py-8">
            No conversations yet.
            <br />
            Create one to get started!
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => {
              const isActive = conversation.id === activeConversationId;
              return (
                <button
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation.id)}
                  className={`
                    w-full text-left px-4 py-3 rounded-lg transition-all
                    ${
                      isActive
                        ? "bg-[#6366f1] text-white shadow-sm"
                        : "bg-white/60 text-[#57575B] hover:bg-white/80"
                    }
                  `}
                >
                  <div className="font-medium truncate mb-1">
                    {conversation.name}
                  </div>
                  <div className={`text-xs ${isActive ? "text-white/80" : "text-[#838389]"}`}>
                    {conversation.messageCount} messages
                    {" • "}
                    {formatDistanceToNow(new Date(conversation.createdAt))}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
      )}

      {/* Agents view placeholder - show when on Agents tab */}
      {isAgentsTab && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-sm text-[#838389] text-center py-8">
            Agent management is displayed in the main content area
          </div>
        </div>
      )}

      {/* Footer with count - only show on Conversations tab */}
      {isConversationsTab && (
        <div className="p-4 border-t border-[#DBDBE5]">
          <div className="text-xs text-[#838389]">
            {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}
    </div>
  );
}
