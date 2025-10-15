/**
 * Agent Styling Utilities
 *
 * Provides consistent styling for agent badges across the A2A UI.
 * Each agent framework has distinct branding:
 * - ADK: Indigo/Purple colors with ✨ icon (primary branding)
 * - Remote A2A: Green/Emerald colors with 🔗 icon
 * - Orchestrator: Neutral gray
 */

/**
 * Agent style configuration interface
 */
export interface AgentStyle {
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: string;
  framework: string;
}

/**
 * Get the styling configuration for an agent based on its name
 *
 * This function determines the visual branding (colors, icons, framework label)
 * for agent badges in the UI. It helps users visually distinguish between:
 * - ADK agents (Budget, Weather, Activity, Restaurant - using app's indigo theme)
 * - Remote A2A agents (External agents - green theme)
 * - The Orchestrator (neutral gray)
 *
 * @param agentName - The name of the agent (case-insensitive)
 * @returns AgentStyle object with colors, icon, and framework label
 */
export function getAgentStyle(agentName?: string): AgentStyle {
  // Handle undefined/null agentName gracefully
  if (!agentName) {
    return {
      bgColor: "bg-gray-100",
      textColor: "text-gray-700",
      borderColor: "border-gray-300",
      icon: "🤖",
      framework: "",
    };
  }

  const nameLower = agentName.toLowerCase();

  // ADK agents - Indigo/Purple branding (matches app theme)
  // These are the primary agents running with Google ADK + Gemini
  if (
    nameLower.includes("budget") ||
    nameLower.includes("weather") ||
    nameLower.includes("activity") ||
    nameLower.includes("restaurant") ||
    nameLower.includes("itinerary") ||
    nameLower.includes("adk")
  ) {
    return {
      bgColor: "bg-gradient-to-r from-indigo-100 to-purple-100",
      textColor: "text-indigo-800",
      borderColor: "border-indigo-400",
      icon: "✨",
      framework: "ADK",
    };
  }

  // Remote A2A agents - Green/Emerald branding
  // These are external agents communicating via A2A protocol
  if (
    nameLower.includes("remote") ||
    nameLower.includes("external") ||
    nameLower.includes("a2a")
  ) {
    return {
      bgColor: "bg-gradient-to-r from-emerald-100 to-green-100",
      textColor: "text-emerald-800",
      borderColor: "border-emerald-400",
      icon: "🔗",
      framework: "A2A",
    };
  }

  // Default/Unknown agent - Neutral styling
  return {
    bgColor: "bg-gray-100",
    textColor: "text-gray-700",
    borderColor: "border-gray-300",
    icon: "🤖",
    framework: "",
  };
}

/**
 * Truncate long text with ellipsis
 *
 * Used to keep agent task descriptions readable in the UI
 * without taking up too much horizontal space.
 *
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation (default: 100)
 * @returns Truncated text with "..." if needed
 */
export function truncateTask(text: any, maxLength: number = 100): string {
  if (typeof text === "string") {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  }
  // Handle non-string values gracefully
  if (text === null || text === undefined) return "";
  return String(text);
}
