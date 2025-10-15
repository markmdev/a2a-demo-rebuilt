"use client";

import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";

export default function SettingsPage() {
  const pathname = usePathname();
  return (
    <div className="relative flex h-screen overflow-hidden bg-[#DEDEE9] p-2">
      <div className="absolute w-[445.84px] h-[445.84px] left-[1040px] top-[11px] rounded-full z-0"
           style={{ background: 'rgba(255, 172, 77, 0.2)', filter: 'blur(103.196px)' }} />

      <div className="flex flex-1 overflow-hidden z-10 gap-2">
        <Sidebar currentPath={pathname} />

        <div className="flex-1 border-2 border-white bg-white/50 backdrop-blur-md shadow-xl flex flex-col rounded-lg overflow-hidden">
          <div className="p-6 border-b border-[#DBDBE5]">
            <h1 className="text-2xl font-semibold text-[#010507] mb-1">Settings</h1>
            <p className="text-sm text-[#57575B]">Configure your A2A demo application</p>
          </div>

          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-2xl space-y-6">
              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-[#DBDBE5]">
                <h3 className="text-lg font-semibold text-[#010507] mb-4">API Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#57575B] mb-2">Google API Key</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 bg-white border border-[#DBDBE5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                      placeholder="Enter your Google API key"
                      disabled
                    />
                    <p className="text-xs text-[#838389] mt-1">Configure in .env.local file</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-[#DBDBE5]">
                <h3 className="text-lg font-semibold text-[#010507] mb-4">About</h3>
                <div className="space-y-2 text-sm text-[#57575B]">
                  <p><strong>Version:</strong> 0.1.0</p>
                  <p><strong>Protocol:</strong> AG-UI + A2A</p>
                  <p><strong>Agent Framework:</strong> Google ADK</p>
                  <p><strong>Model:</strong> Gemini 2.0 Flash</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
