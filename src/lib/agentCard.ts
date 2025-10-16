/**
 * Agent Card Utilities
 *
 * Utilities for fetching and validating A2A agent metadata.
 * Agent cards provide information about agent capabilities and identity.
 *
 * @see {@link https://github.com/agent-matrix/a2a|A2A Protocol Documentation}
 */

/**
 * Standard well-known path for A2A agent cards per the A2A specification
 */
const AGENT_CARD_WELL_KNOWN_PATH = '/.well-known/agent-card.json';

/**
 * Represents an A2A agent's metadata and capabilities
 */
export interface AgentCard {
  name: string;
  description: string;
  url: string;
  version?: string;
  defaultInputModes?: string[];
  defaultOutputModes?: string[];
  capabilities?: {
    streaming?: boolean;
    pushNotifications?: boolean;
  };
  skills?: Array<{
    id: string;
    name: string;
    description: string;
    tags?: string[];
    examples?: string[];
  }>;
}

/**
 * Fetch agent card metadata from an A2A agent's well-known endpoint.
 * The agent card is fetched from the /.well-known/agent-card.json path.
 *
 * @param url - The base URL of the A2A agent (e.g., "http://localhost:9005")
 * @returns Promise resolving to the agent card metadata
 * @throws Error if the agent card cannot be fetched or is invalid
 *
 * @example
 * ```typescript
 * const agentCard = await fetchAgentCard('http://localhost:9005');
 * console.log(agentCard.name); // "Weather Agent"
 * ```
 */
export async function fetchAgentCard(url: string): Promise<AgentCard> {
  // Normalize URL (remove trailing slash, ensure protocol)
  let normalizedUrl = url.replace(/\/$/, '');
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = 'http://' + normalizedUrl;
  }

  try {
    // Fetch agent card from well-known path
    const cardUrl = `${normalizedUrl}${AGENT_CARD_WELL_KNOWN_PATH}`;
    const response = await fetch(cardUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch agent card: ${response.statusText}`);
    }

    const agentCard = await response.json();

    // Basic validation
    if (!agentCard.name || !agentCard.description) {
      throw new Error('Invalid agent card: missing required fields');
    }

    return {
      name: agentCard.name,
      description: agentCard.description,
      url: agentCard.url || normalizedUrl,
      version: agentCard.version,
      defaultInputModes: agentCard.defaultInputModes,
      defaultOutputModes: agentCard.defaultOutputModes,
      capabilities: agentCard.capabilities,
      skills: agentCard.skills,
    };
  } catch (error) {
    console.error('Error fetching agent card:', error);
    throw new Error(`Unable to fetch agent card from ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate that a URL is a valid A2A agent endpoint by attempting
 * to fetch its agent card.
 *
 * @param url - The URL to validate
 * @returns Promise resolving to true if the agent card can be fetched, false otherwise
 *
 * @example
 * ```typescript
 * const isValid = await validateAgentUrl('http://localhost:9005');
 * if (isValid) {
 *   console.log('Agent is reachable');
 * }
 * ```
 */
export async function validateAgentUrl(url: string): Promise<boolean> {
  try {
    await fetchAgentCard(url);
    return true;
  } catch {
    return false;
  }
}
