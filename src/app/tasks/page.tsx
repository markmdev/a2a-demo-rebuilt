"use client";

import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";

export default function TasksPage() {
  const pathname = usePathname();
  return (
    <div className="relative flex h-screen overflow-hidden bg-[#DEDEE9] p-2">
      {/* Background gradients */}
      <div className="absolute w-[445.84px] h-[445.84px] left-[1040px] top-[11px] rounded-full z-0"
           style={{ background: 'rgba(255, 172, 77, 0.2)', filter: 'blur(103.196px)' }} />
      <div className="absolute w-[609.35px] h-[609.35px] left-[1338.97px] top-[624.5px] rounded-full z-0"
           style={{ background: '#C9C9DA', filter: 'blur(103.196px)' }} />

      <div className="flex flex-1 overflow-hidden z-10 gap-2">
        <Sidebar currentPath={pathname} />

        {/* Main Content */}
        <div className="flex-1 border-2 border-white bg-white/50 backdrop-blur-md shadow-xl flex flex-col rounded-lg overflow-hidden">
          <div className="p-6 border-b border-[#DBDBE5]">
            <h1 className="text-2xl font-semibold text-[#010507] mb-1">Tasks</h1>
            <p className="text-sm text-[#57575B]">Monitor agent task execution and progress</p>
          </div>

          <div className="flex-1 overflow-auto p-6">
            <div className="bg-white/40 backdrop-blur-sm rounded-lg p-12 border border-dashed border-[#DBDBE5] text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-[#838389]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <h3 className="text-lg font-semibold text-[#010507] mb-2">No Tasks Yet</h3>
              <p className="text-sm text-[#57575B]">Tasks will appear here as agents process requests</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
