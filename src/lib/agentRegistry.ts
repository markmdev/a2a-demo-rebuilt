/**
 * Agent Registry
 *
 * In-memory registry of A2A agents.
 * Shared between API routes and CopilotKit endpoint.
 */

// Singleton pattern for HMR survival in development
// This prevents losing registered agents during Fast Refresh/HMR
// Still resets on server restart (as intended)
declare global {
  // eslint-disable-next-line no-var
  var __registeredAgentUrls: Set<string> | undefined;
}

export const registeredAgentUrls = globalThis.__registeredAgentUrls ??= new Set<string>();

// Initialize with default agents from environment
// const defaultWeatherAgent = process.env.WEATHER_AGENT_URL || 'http://localhost:9005';
// registeredAgentUrls.add(defaultWeatherAgent);

/**
 * Get the current list of registered agent URLs
 */
export function getRegisteredAgentUrls(): string[] {
  return Array.from(registeredAgentUrls);
}
