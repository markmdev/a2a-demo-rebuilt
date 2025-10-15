/**
 * Agents API Route
 *
 * Manages the in-memory registry of A2A agents.
 * Provides endpoints to list, register, and unregister agents dynamically.
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchAgentCard, AgentCard } from '@/lib/agentCard';
import { registeredAgentUrls } from '@/lib/agentRegistry';

/**
 * GET /api/agents
 *
 * Returns list of all registered agents with their metadata
 */
export async function GET() {
  try {
    const agents: AgentCard[] = [];

    // Fetch metadata for all registered agents
    for (const url of registeredAgentUrls) {
      try {
        const card = await fetchAgentCard(url);
        agents.push(card);
      } catch (error) {
        console.error(`Failed to fetch agent card for ${url}:`, error);
        // Include agent with minimal info if fetch fails
        agents.push({
          name: 'Unknown Agent',
          description: 'Failed to fetch metadata',
          url,
        });
      }
    }

    return NextResponse.json({
      agents,
      count: agents.length,
    });
  } catch (error) {
    console.error('Error listing agents:', error);
    return NextResponse.json(
      { error: 'Failed to list agents' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agents
 *
 * Register a new agent by URL
 * Body: { url: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid url field' },
        { status: 400 }
      );
    }

    // Normalize URL
    const normalizedUrl = url.replace(/\/$/, '');

    // Check if already registered
    if (registeredAgentUrls.has(normalizedUrl)) {
      return NextResponse.json(
        { error: 'Agent already registered', url: normalizedUrl },
        { status: 409 }
      );
    }

    // Fetch and validate agent card
    let agentCard: AgentCard;
    try {
      agentCard = await fetchAgentCard(normalizedUrl);
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Failed to validate agent',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 400 }
      );
    }

    // Add to registry
    registeredAgentUrls.add(normalizedUrl);

    console.log(`✅ Registered agent: ${agentCard.name} at ${normalizedUrl}`);

    return NextResponse.json({
      message: 'Agent registered successfully',
      agent: agentCard,
    });
  } catch (error) {
    console.error('Error registering agent:', error);
    return NextResponse.json(
      { error: 'Failed to register agent' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/agents
 *
 * Unregister an agent by URL
 * Body: { url: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid url field' },
        { status: 400 }
      );
    }

    // Normalize URL
    const normalizedUrl = url.replace(/\/$/, '');

    // Check if agent exists
    if (!registeredAgentUrls.has(normalizedUrl)) {
      return NextResponse.json(
        { error: 'Agent not found', url: normalizedUrl },
        { status: 404 }
      );
    }

    // Remove from registry
    registeredAgentUrls.delete(normalizedUrl);

    console.log(`🗑️ Unregistered agent: ${normalizedUrl}`);

    return NextResponse.json({
      message: 'Agent unregistered successfully',
      url: normalizedUrl,
    });
  } catch (error) {
    console.error('Error unregistering agent:', error);
    return NextResponse.json(
      { error: 'Failed to unregister agent' },
      { status: 500 }
    );
  }
}
