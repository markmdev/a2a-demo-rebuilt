"use client";

import Link from "next/link";

interface SidebarProps {
  currentPath: string;
}

export default function Sidebar({ currentPath }: SidebarProps) {
  const isActive = (path: string) => currentPath === path;

  const getLinkClassName = (path: string) => {
    return isActive(path)
      ? "flex items-center gap-3 px-4 py-3 rounded-lg bg-[#6366f1] text-white font-medium shadow-sm"
      : "flex items-center gap-3 px-4 py-3 rounded-lg text-[#57575B] hover:bg-white/60 transition-colors";
  };

  return (
    <div className="w-[280px] flex-shrink-0 border-2 border-white bg-white/50 backdrop-blur-md shadow-xl flex flex-col rounded-lg overflow-hidden">
      <div className="p-6 border-b border-[#DBDBE5]">
        <h1 className="text-2xl font-bold text-[#010507] mb-2">A2A Demo</h1>
        <p className="text-sm text-[#57575B]">Agent-to-Agent Communication</p>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          <Link
            href="/conversations"
            className={getLinkClassName("/conversations")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Conversations
          </Link>

          <Link
            href="/agents"
            className={getLinkClassName("/agents")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Agents
          </Link>
        </div>
      </nav>

      <div className="p-4 border-t border-[#DBDBE5]">
        <div className="text-xs text-[#838389] space-y-1">
          <p>AG-UI Protocol</p>
          <p>Google ADK + Gemini</p>
        </div>
      </div>
    </div>
  );
}
