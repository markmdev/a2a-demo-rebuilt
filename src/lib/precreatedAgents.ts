/**
 * Precreated Agents Configuration
 *
 * Defines the demo agents that are part of this A2A showcase.
 * These agents can be quickly added from the Agents page UI.
 * Each agent runs on a specific port and communicates via the A2A Protocol.
 */

/**
 * Represents a preconfigured A2A agent available for quick registration
 */
export interface PrecreatedAgent {
  id: string;
  name: string;
  description: string;
  url: string;
  port: number;
  icon: string;
  category: string;
}

/**
 * List of precreated demo agents
 */
export const PRECREATED_AGENTS: PrecreatedAgent[] = [
  {
    id: 'weather',
    name: 'Weather Agent',
    description: 'Provides weather forecasts and travel weather advice for destinations',
    url: 'http://localhost:9005',
    port: 9005,
    icon: '🌤️',
    category: 'travel',
  },
  {
    id: 'activities',
    name: 'Activities Agent',
    description: 'Suggests activities based on weather forecasts and user preferences',
    url: 'http://localhost:9006',
    port: 9006,
    icon: '🎯',
    category: 'travel',
  },
  {
    id: 'weekend_planner',
    name: 'Weekend Planner',
    description: 'Synthesizes weather and activities into comprehensive weekend plans',
    url: 'http://localhost:9007',
    port: 9007,
    icon: '📅',
    category: 'travel',
  },
];

/**
 * Get a precreated agent by its ID
 *
 * @param id - The unique identifier of the agent (e.g., "weather", "activities")
 * @returns The precreated agent configuration, or undefined if not found
 *
 * @example
 * ```typescript
 * const weatherAgent = getPrecreatedAgent('weather');
 * if (weatherAgent) {
 *   console.log(weatherAgent.url); // "http://localhost:9005"
 * }
 * ```
 */
export function getPrecreatedAgent(id: string): PrecreatedAgent | undefined {
  return PRECREATED_AGENTS.find(agent => agent.id === id);
}

/**
 * Check if a URL matches one of the precreated agents
 *
 * @param url - The URL to check (trailing slashes are normalized)
 * @returns True if the URL matches a precreated agent, false otherwise
 *
 * @example
 * ```typescript
 * const isPrecreated = isPrecreatedAgentUrl('http://localhost:9005');
 * console.log(isPrecreated); // true (matches weather agent)
 * ```
 */
export function isPrecreatedAgentUrl(url: string): boolean {
  const normalizedUrl = url.replace(/\/$/, '');
  return PRECREATED_AGENTS.some(agent => agent.url === normalizedUrl);
}
