"use client";

import Sidebar from "@/components/Sidebar";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { AgentCard } from "@/lib/agentCard";

export default function AgentsPage() {
  const pathname = usePathname();
  const [agents, setAgents] = useState<AgentCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newAgentUrl, setNewAgentUrl] = useState("");
  const [validatingAgent, setValidatingAgent] = useState(false);
  const [error, setError] = useState("");

  // Fetch agents from API
  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/agents");
      const data = await response.json();
      setAgents(data.agents || []);
    } catch (err) {
      console.error("Failed to fetch agents:", err);
      setError("Failed to load agents");
    } finally {
      setLoading(false);
    }
  };

  // Load agents on mount
  useEffect(() => {
    fetchAgents();
  }, []);

  // Add new agent
  const handleAddAgent = async () => {
    if (!newAgentUrl.trim()) {
      setError("Please enter a valid URL");
      return;
    }

    setValidatingAgent(true);
    setError("");

    try {
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newAgentUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to register agent");
        return;
      }

      // Success - refresh list and close dialog
      await fetchAgents();
      setShowAddDialog(false);
      setNewAgentUrl("");
      setError("");
    } catch (err) {
      console.error("Failed to add agent:", err);
      setError("Failed to register agent");
    } finally {
      setValidatingAgent(false);
    }
  };

  // Remove agent
  const handleRemoveAgent = async (url: string) => {
    if (!confirm(`Remove agent at ${url}?`)) {
      return;
    }

    try {
      const response = await fetch("/api/agents", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Failed to remove agent");
        return;
      }

      // Success - refresh list
      await fetchAgents();
    } catch (err) {
      console.error("Failed to remove agent:", err);
      alert("Failed to remove agent");
    }
  };

  return (
    <div className="relative flex h-screen overflow-hidden bg-[#DEDEE9] p-2">
      {/* Background gradients */}
      <div className="absolute w-[445.84px] h-[445.84px] left-[1040px] top-[11px] rounded-full z-0"
           style={{ background: 'rgba(255, 172, 77, 0.2)', filter: 'blur(103.196px)' }} />
      <div className="absolute w-[609.35px] h-[609.35px] left-[1338.97px] top-[624.5px] rounded-full z-0"
           style={{ background: '#C9C9DA', filter: 'blur(103.196px)' }} />

      <div className="flex flex-1 overflow-hidden z-10 gap-2">
        <Sidebar currentPath={pathname} />

        {/* Main Content Area */}
        <div className="flex-1 border-2 border-white bg-white/50 backdrop-blur-md shadow-xl flex flex-col rounded-lg overflow-hidden">
          <div className="p-6 border-b border-[#DBDBE5] flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-[#010507] mb-1">A2A Agents</h1>
              <p className="text-sm text-[#57575B]">
                Manage dynamically registered agents
              </p>
            </div>
            <button
              onClick={() => setShowAddDialog(true)}
              className="px-4 py-2 bg-[#6366f1] text-white rounded-lg hover:bg-[#5558e3] transition-colors font-medium"
            >
              + Add Agent
            </button>
          </div>

          <div className="flex-1 overflow-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-[#838389]">Loading agents...</div>
              </div>
            ) : agents.length === 0 ? (
              <div className="bg-white/40 backdrop-blur-sm rounded-lg p-12 border border-dashed border-[#DBDBE5] text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-[#838389]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-[#010507] mb-2">
                  No Agents Registered
                </h3>
                <p className="text-sm text-[#57575B] mb-4">
                  Get started by adding your first A2A agent
                </p>
                <button
                  onClick={() => setShowAddDialog(true)}
                  className="px-4 py-2 bg-[#6366f1] text-white rounded-lg hover:bg-[#5558e3] transition-colors font-medium"
                >
                  + Add Agent
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {agents.map((agent) => (
                  <div key={agent.url} className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-[#DBDBE5] shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-[#6366f1] flex items-center justify-center">
                            <span className="text-white font-bold">
                              {agent.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-[#010507]">{agent.name}</h3>
                            <p className="text-xs text-[#838389]">{agent.url}</p>
                          </div>
                        </div>
                        <p className="text-sm text-[#57575B] mb-4">
                          {agent.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 bg-[#6366f1]/10 text-[#6366f1] text-xs font-medium rounded-full">
                            A2A Protocol
                          </span>
                          {agent.capabilities?.streaming && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                              Streaming
                            </span>
                          )}
                          {agent.version && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                              v{agent.version}
                            </span>
                          )}
                        </div>
                        {agent.skills && agent.skills.length > 0 && (
                          <div className="mt-4">
                            <p className="text-xs font-semibold text-[#838389] mb-2">SKILLS:</p>
                            <div className="space-y-1">
                              {agent.skills.map((skill) => (
                                <div key={skill.id} className="text-sm text-[#57575B]">
                                  • {skill.name}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveAgent(agent.url)}
                        className="ml-4 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove agent"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Agent Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h2 className="text-xl font-semibold text-[#010507] mb-4">Add A2A Agent</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[#57575B] mb-2">
                Agent URL
              </label>
              <input
                type="text"
                value={newAgentUrl}
                onChange={(e) => setNewAgentUrl(e.target.value)}
                placeholder="http://localhost:9003"
                className="w-full px-3 py-2 border border-[#DBDBE5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366f1]"
                disabled={validatingAgent}
              />
              <p className="text-xs text-[#838389] mt-1">
                Enter the base URL of the A2A agent to register
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddDialog(false);
                  setNewAgentUrl("");
                  setError("");
                }}
                className="flex-1 px-4 py-2 border border-[#DBDBE5] text-[#57575B] rounded-lg hover:bg-gray-50 transition-colors"
                disabled={validatingAgent}
              >
                Cancel
              </button>
              <button
                onClick={handleAddAgent}
                className="flex-1 px-4 py-2 bg-[#6366f1] text-white rounded-lg hover:bg-[#5558e3] transition-colors font-medium disabled:opacity-50"
                disabled={validatingAgent}
              >
                {validatingAgent ? "Validating..." : "Add Agent"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
