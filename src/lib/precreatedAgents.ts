/**
 * Precreated Agents Configuration
 *
 * Defines the demo agents that are part of this A2A showcase.
 * These agents can be quickly added from the Agents page UI.
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
 * Get a precreated agent by ID
 */
export function getPrecreatedAgent(id: string): PrecreatedAgent | undefined {
  return PRECREATED_AGENTS.find(agent => agent.id === id);
}

/**
 * Check if a URL matches a precreated agent
 */
export function isPrecreatedAgentUrl(url: string): boolean {
  const normalizedUrl = url.replace(/\/$/, '');
  return PRECREATED_AGENTS.some(agent => agent.url === normalizedUrl);
}
