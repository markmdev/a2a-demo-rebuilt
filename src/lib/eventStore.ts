/**
 * Event Store
 *
 * In-memory storage for conversation events (messages, A2A calls, etc.)
 * Events are scoped per conversation
 */

import { Event, EventType, isTaskEvent } from "@/types/event";

/**
 * EventStore class
 * Manages events for all conversations in memory
 */
class EventStore {
  // Map: conversationId → Event[]
  private events: Map<string, Event[]> = new Map();

  /**
   * Find an event by message ID (for USER_MESSAGE and ASSISTANT_MESSAGE events)
   * @returns The event if found, undefined otherwise
   */
  private findEventByMessageId(conversationId: string, messageId: string): Event | undefined {
    const conversationEvents = this.events.get(conversationId) || [];
    return conversationEvents.find(
      (event) =>
        (event.type === EventType.USER_MESSAGE || event.type === EventType.ASSISTANT_MESSAGE) &&
        event.messageId === messageId
    );
  }

  /**
   * Add an event to a conversation
   * Automatically deduplicates USER_MESSAGE and ASSISTANT_MESSAGE events by messageId
   */
  addEvent(conversationId: string, event: Event): void {
    const conversationEvents = this.events.get(conversationId) || [];

    // Deduplicate USER_MESSAGE and ASSISTANT_MESSAGE events by messageId
    if (event.type === EventType.USER_MESSAGE || event.type === EventType.ASSISTANT_MESSAGE) {
      const existingEvent = this.findEventByMessageId(conversationId, event.messageId);
      if (existingEvent) {
        // Event with this messageId already exists, skip adding
        return;
      }
    }

    conversationEvents.push(event);
    this.events.set(conversationId, conversationEvents);
  }

  /**
   * Update an existing event by ID
   */
  updateEvent(conversationId: string, eventId: string, updates: Partial<Event>): boolean {
    const conversationEvents = this.events.get(conversationId);
    if (!conversationEvents) return false;

    const eventIndex = conversationEvents.findIndex((e) => e.id === eventId);
    if (eventIndex === -1) return false;

    // Update the event with new fields
    conversationEvents[eventIndex] = {
      ...conversationEvents[eventIndex],
      ...updates,
    } as Event;

    return true;
  }

  /**
   * Get all events for a conversation
   */
  getEvents(conversationId: string): Event[] {
    return this.events.get(conversationId) || [];
  }

  /**
   * Get only task events (A2A calls/responses) for a conversation
   */
  getTasks(conversationId: string): Event[] {
    const allEvents = this.getEvents(conversationId);
    return allEvents.filter(isTaskEvent);
  }

  /**
   * Get events filtered by type
   */
  getEventsByType(conversationId: string, type: EventType): Event[] {
    const allEvents = this.getEvents(conversationId);
    return allEvents.filter((event) => event.type === type);
  }

  /**
   * Clear all events for a conversation
   */
  clearEvents(conversationId: string): void {
    this.events.delete(conversationId);
  }

  /**
   * Clear all events (for all conversations)
   */
  clearAll(): void {
    this.events.clear();
  }

  /**
   * Get event count for a conversation
   */
  getEventCount(conversationId: string): number {
    return this.getEvents(conversationId).length;
  }

  /**
   * Get task count for a conversation
   */
  getTaskCount(conversationId: string): number {
    return this.getTasks(conversationId).length;
  }
}

// Singleton pattern for HMR survival in development
// This prevents losing events during Fast Refresh/HMR
// Still resets on server restart (as intended)
declare global {
  // eslint-disable-next-line no-var
  var __eventStore: EventStore | undefined;
}

export const eventStore = globalThis.__eventStore ??= new EventStore();
