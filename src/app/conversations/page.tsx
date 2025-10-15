/**
 * Conversations Root Page
 *
 * Displayed when no conversation is selected (/conversations)
 * Shows empty state prompting user to select or create a conversation
 */

import React from "react";

export default function ConversationsPage() {
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
