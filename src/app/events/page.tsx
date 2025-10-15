"use client";

import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";

export default function EventsPage() {
  const pathname = usePathname();
  return (
    <div className="relative flex h-screen overflow-hidden bg-[#DEDEE9] p-2">
      <div className="absolute w-[445.84px] h-[445.84px] left-[1040px] top-[11px] rounded-full z-0"
           style={{ background: 'rgba(255, 172, 77, 0.2)', filter: 'blur(103.196px)' }} />

      <div className="flex flex-1 overflow-hidden z-10 gap-2">
        <Sidebar currentPath={pathname} />

        <div className="flex-1 border-2 border-white bg-white/50 backdrop-blur-md shadow-xl flex flex-col rounded-lg overflow-hidden">
          <div className="p-6 border-b border-[#DBDBE5]">
            <h1 className="text-2xl font-semibold text-[#010507] mb-1">Events</h1>
            <p className="text-sm text-[#57575B]">Real-time event stream from agents</p>
          </div>

          <div className="flex-1 overflow-auto p-6">
            <div className="bg-white/40 backdrop-blur-sm rounded-lg p-12 border border-dashed border-[#DBDBE5] text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-[#838389]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h3 className="text-lg font-semibold text-[#010507] mb-2">No Events Yet</h3>
              <p className="text-sm text-[#57575B]">Events will stream here as agents communicate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
