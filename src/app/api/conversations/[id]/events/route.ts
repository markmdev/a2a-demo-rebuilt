/**
 * Events API Route
 *
 * GET  /api/conversations/[id]/events      - Get all events or filtered by type
 * POST /api/conversations/[id]/events      - Add a new event
 */

import { NextRequest, NextResponse } from "next/server";
import { eventStore } from "@/lib/eventStore";
import { Event, EventType } from "@/types/event";

/**
 * GET /api/conversations/[id]/events
 * Fetches events for a conversation
 *
 * Query params:
 * - filter: "tasks" | "messages" | EventType value - Filter by event type
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter");

    let events: Event[];

    if (filter === "tasks") {
      // Get only A2A call/response events
      events = eventStore.getTasks(id);
    } else if (filter && Object.values(EventType).includes(filter as EventType)) {
      // Filter by specific event type
      events = eventStore.getEventsByType(id, filter as EventType);
    } else {
      // Get all events
      events = eventStore.getEvents(id);
    }

    return NextResponse.json({ events, count: events.length });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/conversations/[id]/events
 * Adds a new event to a conversation
 *
 * Body: { event: Event }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.event) {
      return NextResponse.json(
        { error: "Missing event in request body" },
        { status: 400 }
      );
    }

    const event: Event = body.event;

    // Ensure conversationId matches route param
    if (event.conversationId !== id) {
      return NextResponse.json(
        { error: "Event conversationId does not match route parameter" },
        { status: 400 }
      );
    }

    // Add event to store
    eventStore.addEvent(id, event);

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error("Error adding event:", error);
    return NextResponse.json(
      { error: "Failed to add event" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/conversations/[id]/events
 * Updates an existing event
 *
 * Body: { eventId: string, updates: Partial<Event> }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.eventId) {
      return NextResponse.json(
        { error: "Missing eventId in request body" },
        { status: 400 }
      );
    }

    if (!body.updates) {
      return NextResponse.json(
        { error: "Missing updates in request body" },
        { status: 400 }
      );
    }

    const success = eventStore.updateEvent(id, body.eventId, body.updates);

    if (!success) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}
