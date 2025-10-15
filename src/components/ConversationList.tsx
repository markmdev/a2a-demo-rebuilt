"use client";

import { useConversation } from "@/lib/contexts/ConversationContext";
import { formatDistanceToNow } from "@/lib/utils";

/**
 * ConversationList Component
 *
 * Secondary sidebar that displays all conversations with:
 * - "+ New Conversation" button at the top
 * - Scrollable list of conversations
 * - Active conversation highlighted in indigo
 * - Click handlers to switch conversations
 */
export default function ConversationList() {
  const {
    conversations,
    activeConversationId,
    loading,
    createConversation,
    setActiveConversation,
  } = useConversation();

  const handleCreateConversation = async () => {
    await createConversation();
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversation(id);
  };

  return (
    <div className="w-[300px] flex-shrink-0 border-2 border-white bg-white/50 backdrop-blur-md shadow-xl flex flex-col rounded-lg overflow-hidden">
      {/* Header with New Conversation Button */}
      <div className="p-4 border-b border-[#DBDBE5]">
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

      {/* Conversation List */}
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

      {/* Footer with count */}
      <div className="p-4 border-t border-[#DBDBE5]">
        <div className="text-xs text-[#838389]">
          {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}
