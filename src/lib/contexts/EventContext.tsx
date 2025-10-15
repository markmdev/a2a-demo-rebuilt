"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import {
  Event,
  EventType,
  UserMessageEvent,
  AssistantMessageEvent,
  A2ACallEvent,
  A2AResponseEvent,
  ErrorEvent,
} from "@/types/event";

interface EventContextType {
  events: Event[];
  loading: boolean;
  error: string | null;
  fetchEvents: (conversationId: string, filter?: string) => Promise<void>;
  logUserMessage: (conversationId: string, messageId: string, content: string) => Promise<string | null>;
  logAssistantMessage: (conversationId: string, messageId: string, content: string) => Promise<string | null>;
  updateAssistantMessage: (conversationId: string, eventId: string, content: string) => Promise<void>;
  logA2ACall: (conversationId: string, actionId: string, agentName: string, task: string) => Promise<void>;
  logA2AResponse: (conversationId: string, actionId: string, agentName: string, task: string, result: string, durationMs?: number, status?: "success" | "error") => Promise<void>;
  logError: (conversationId: string, message: string, details?: string, relatedEventId?: string) => Promise<void>;
  clearEvents: () => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

/**
 * Event Provider
 *
 * Manages event state and provides methods to log different types of events
 */
export function EventProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch events for a conversation
   */
  const fetchEvents = useCallback(async (conversationId: string, filter?: string) => {
    try {
      setLoading(true);
      setError(null);

      const url = filter
        ? `/api/conversations/${conversationId}/events?filter=${filter}`
        : `/api/conversations/${conversationId}/events`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      const data = await response.json();
      setEvents(data.events);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Helper to post an event to the API and update local state
   */
  const postEvent = useCallback(async (conversationId: string, event: Event) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ event }),
      });

      if (!response.ok) {
        throw new Error("Failed to log event");
      }

      // Add to local state for real-time updates (with deduplication)
      setEvents((prev) => {
        // Deduplicate USER_MESSAGE and ASSISTANT_MESSAGE events by messageId
        if (event.type === EventType.USER_MESSAGE || event.type === EventType.ASSISTANT_MESSAGE) {
          const existingEvent = prev.find(
            (e) =>
              (e.type === EventType.USER_MESSAGE || e.type === EventType.ASSISTANT_MESSAGE) &&
              e.messageId === event.messageId
          );

          if (existingEvent) {
            // Event with this messageId already exists, skip adding
            return prev;
          }
        }

        return [...prev, event];
      });
    } catch (err) {
      console.error("Error logging event:", err);
    }
  }, []);

  /**
   * Log a user message event
   */
  const logUserMessage = useCallback(async (conversationId: string, messageId: string, content: string): Promise<string | null> => {
    const event: UserMessageEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      timestamp: new Date().toISOString(),
      type: EventType.USER_MESSAGE,
      messageId,
      content,
    };

    await postEvent(conversationId, event);
    return event.id;
  }, [postEvent]);

  /**
   * Log an assistant message event
   */
  const logAssistantMessage = useCallback(async (conversationId: string, messageId: string, content: string): Promise<string | null> => {
    const event: AssistantMessageEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      timestamp: new Date().toISOString(),
      type: EventType.ASSISTANT_MESSAGE,
      messageId,
      content,
    };

    await postEvent(conversationId, event);
    return event.id;
  }, [postEvent]);

  /**
   * Update an existing assistant message event with new content
   */
  const updateAssistantMessage = useCallback(async (conversationId: string, eventId: string, content: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/events`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
          updates: { content },
        }),
      });

      if (!response.ok) {
        const rtext = await response.text()
        console.log(rtext);
        throw new Error("Failed to update event");
      }

      // Update local state
      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId
            ? { ...event, content: content as any } // Type assertion needed due to discriminated union
            : event
        )
      );
    } catch (err) {
      console.error("Error updating event:", err);
    }
  }, []);

  /**
   * Log an A2A call event (task delegation)
   */
  const logA2ACall = useCallback(async (conversationId: string, actionId: string, agentName: string, task: string) => {
    const event: A2ACallEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      timestamp: new Date().toISOString(),
      type: EventType.A2A_CALL,
      actionId,
      agentName,
      task,
    };

    await postEvent(conversationId, event);
  }, [postEvent]);

  /**
   * Log an A2A response event (task completion)
   */
  const logA2AResponse = useCallback(async (
    conversationId: string,
    actionId: string,
    agentName: string,
    task: string,
    result: string,
    durationMs?: number,
    status: "success" | "error" = "success"
  ) => {
    const event: A2AResponseEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      timestamp: new Date().toISOString(),
      type: EventType.A2A_RESPONSE,
      actionId,
      agentName,
      task,
      result,
      durationMs,
      status,
    };

    await postEvent(conversationId, event);
  }, [postEvent]);

  /**
   * Log an error event
   */
  const logError = useCallback(async (conversationId: string, message: string, details?: string, relatedEventId?: string) => {
    const event: ErrorEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conversationId,
      timestamp: new Date().toISOString(),
      type: EventType.ERROR,
      message,
      details,
      relatedEventId,
    };

    await postEvent(conversationId, event);
  }, [postEvent]);

  /**
   * Clear events from local state
   */
  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  const value: EventContextType = {
    events,
    loading,
    error,
    fetchEvents,
    logUserMessage,
    logAssistantMessage,
    updateAssistantMessage,
    logA2ACall,
    logA2AResponse,
    logError,
    clearEvents,
  };

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  );
}

/**
 * Hook to use event context
 */
export function useEvents() {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error("useEvents must be used within an EventProvider");
  }
  return context;
}
