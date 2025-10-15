/**
 * Conversations Layout
 *
 * Persistent three-column layout:
 * [Nav Sidebar 280px] [Conversation List 300px] [{children} flex-1]
 *
 * The left two columns remain mounted across navigation,
 * only the right column (children) changes when navigating to /conversations/[id]
 */

import React from "react";
import Sidebar from "@/components/Sidebar";
import ConversationList from "@/components/ConversationList";

export default function ConversationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

      {/* Three-Column Layout */}
      <div className="flex flex-1 overflow-hidden z-10 gap-2">
        {/* Column 1: Navigation Sidebar (Persistent) */}
        <Sidebar currentPath={"/conversation"} />

        {/* Column 2: Conversation List (Persistent) */}
        <ConversationList />

        {/* Column 3: Dynamic Content Area (children) */}
        {children}
      </div>
    </div>
  );
}
