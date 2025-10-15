"use client";

import React, { useEffect, useState, useRef } from "react";
import { useEvents } from "@/lib/contexts/EventContext";
import { Event, EventType, isTaskEvent } from "@/types/event";

interface EventPanelProps {
  conversationId: string;
}

/**
 * EventPanel Component
 *
 * Displays real-time events for a conversation with tabs:
 * - "All Events" - Shows all events chronologically
 * - "Tasks" - Shows only A2A calls and responses
 */
export default function EventPanel({ conversationId }: EventPanelProps) {
  const { events, loading, fetchEvents } = useEvents();
  const [activeTab, setActiveTab] = useState<"all" | "tasks">("all");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch events when conversation changes
  useEffect(() => {
    if (conversationId) {
      fetchEvents(conversationId);
    }
  }, [conversationId, fetchEvents]);

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  // Filter events based on active tab
  const displayedEvents = activeTab === "tasks" ? events.filter(isTaskEvent) : events;

  return (
    <div className="w-full h-full border-2 border-white bg-white/50 backdrop-blur-md shadow-xl flex flex-col rounded-lg overflow-hidden">
      {/* Header with Tabs */}
      <div className="p-4 border-b border-[#DBDBE5]">
        <h2 className="text-lg font-semibold text-[#010507] mb-3">Event Log</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "all"
                ? "bg-[#6366f1] text-white"
                : "bg-white/60 text-[#57575B] hover:bg-white/80"
            }`}
          >
            All Events
            <span className="ml-2 text-xs opacity-75">({events.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("tasks")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "tasks"
                ? "bg-[#6366f1] text-white"
                : "bg-white/60 text-[#57575B] hover:bg-white/80"
            }`}
          >
            Tasks
            <span className="ml-2 text-xs opacity-75">({events.filter(isTaskEvent).length})</span>
          </button>
        </div>
      </div>

      {/* Event List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading && events.length === 0 ? (
          <div className="text-sm text-[#838389] text-center py-8">Loading events...</div>
        ) : displayedEvents.length === 0 ? (
          <div className="text-sm text-[#838389] text-center py-8">
            {activeTab === "tasks" ? "No tasks yet" : "No events yet"}
          </div>
        ) : (
          displayedEvents.map((event) => <EventItem key={event.id} event={event} />)
        )}
      </div>
    </div>
  );
}

/**
 * EventItem Component
 * Renders a single event with type-specific styling
 */
function EventItem({ event }: { event: Event }) {
  const [expanded, setExpanded] = useState(false);

  // Format timestamp
  const time = new Date(event.timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // Get event type badge styling
  const getBadgeStyle = (type: EventType) => {
    switch (type) {
      case EventType.USER_MESSAGE:
        return "bg-blue-100 text-blue-800";
      case EventType.ASSISTANT_MESSAGE:
        return "bg-green-100 text-green-800";
      case EventType.A2A_CALL:
        return "bg-purple-100 text-purple-800";
      case EventType.A2A_RESPONSE:
        return "bg-indigo-100 text-indigo-800";
      case EventType.ERROR:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get event label
  const getEventLabel = (type: EventType) => {
    switch (type) {
      case EventType.USER_MESSAGE:
        return "User";
      case EventType.ASSISTANT_MESSAGE:
        return "Assistant";
      case EventType.A2A_CALL:
        return "A2A Call";
      case EventType.A2A_RESPONSE:
        return "A2A Response";
      case EventType.ERROR:
        return "Error";
      default:
        return type;
    }
  };

  return (
    <div className="bg-white/80 rounded-lg p-3 border border-[#DBDBE5] hover:shadow-sm transition-shadow">
      {/* Event Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-semibold ${getBadgeStyle(event.type)}`}>
            {getEventLabel(event.type)}
          </span>
          <span className="text-xs text-[#838389]">{time}</span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-[#6366f1] hover:underline"
        >
          {expanded ? "Less" : "More"}
        </button>
      </div>

      {/* Event Content */}
      <div className="text-sm text-[#010507]">
        {event.type === EventType.USER_MESSAGE && (
          <div>
            <p className="font-medium mb-1">User Message</p>
            <p className={`text-[#57575B] break-words ${expanded ? 'whitespace-pre-wrap' : 'line-clamp-2'}`}>
              {event.content}
            </p>
          </div>
        )}

        {event.type === EventType.ASSISTANT_MESSAGE && (
          <div>
            <p className="font-medium mb-1">Assistant Response</p>
            <p className={`text-[#57575B] break-words ${expanded ? 'whitespace-pre-wrap' : 'line-clamp-2'}`}>
              {event.content}
            </p>
          </div>
        )}

        {event.type === EventType.A2A_CALL && (
          <div>
            <p className="font-medium mb-1">
              → {event.agentName}
            </p>
            <p className={`text-[#57575B] break-words ${expanded ? 'whitespace-pre-wrap' : 'line-clamp-2'}`}>
              {event.task}
            </p>
          </div>
        )}

        {event.type === EventType.A2A_RESPONSE && (
          <div>
            <p className="font-medium mb-1">
              ← {event.agentName}
              {event.durationMs && (
                <span className="ml-2 text-xs text-[#838389]">({event.durationMs}ms)</span>
              )}
            </p>
            {expanded ? (
              <pre className="text-[#57575B] text-xs bg-gray-50 p-2 rounded max-h-[300px] overflow-y-auto whitespace-pre-wrap break-words">
                {event.result}
              </pre>
            ) : (
              <p className="text-[#57575B] break-words line-clamp-2">{event.result}</p>
            )}
          </div>
        )}

        {event.type === EventType.ERROR && (
          <div>
            <p className="font-medium text-red-600 mb-1">{event.message}</p>
            {event.details && (
              <p className={`text-[#57575B] text-xs break-words ${expanded ? 'whitespace-pre-wrap' : 'line-clamp-2'}`}>
                {event.details}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-[#DBDBE5] text-xs text-[#838389] space-y-1">
          <div>
            <span className="font-semibold">Event ID:</span> {event.id}
          </div>
          <div>
            <span className="font-semibold">Timestamp:</span> {event.timestamp}
          </div>
          {event.type === EventType.USER_MESSAGE && (
            <div>
              <span className="font-semibold">Message ID:</span> {event.messageId}
            </div>
          )}
          {event.type === EventType.ASSISTANT_MESSAGE && (
            <div>
              <span className="font-semibold">Message ID:</span> {event.messageId}
            </div>
          )}
          {(event.type === EventType.A2A_CALL || event.type === EventType.A2A_RESPONSE) && (
            <div>
              <span className="font-semibold">Action ID:</span> {event.actionId}
            </div>
          )}
          {event.type === EventType.A2A_RESPONSE && event.status && (
            <div>
              <span className="font-semibold">Status:</span> {event.status}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
