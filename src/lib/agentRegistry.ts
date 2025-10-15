/**
 * Agent Registry
 *
 * In-memory registry of A2A agents.
 * Shared between API routes and CopilotKit endpoint.
 */

// In-memory agent registry
// Persists during server lifetime, resets on restart
export const registeredAgentUrls = new Set<string>();

// Initialize with default agents from environment
// const defaultWeatherAgent = process.env.WEATHER_AGENT_URL || 'http://localhost:9005';
// registeredAgentUrls.add(defaultWeatherAgent);

/**
 * Get the current list of registered agent URLs
 */
export function getRegisteredAgentUrls(): string[] {
  return Array.from(registeredAgentUrls);
}
