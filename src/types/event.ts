/**
 * Event Types for A2A Demo
 *
 * Tracks all communication events in conversations:
 * - User messages
 * - Assistant responses
 * - A2A agent calls (tasks)
 * - A2A agent responses
 * - Errors
 */

/**
 * Enum of all event types
 */
export enum EventType {
  USER_MESSAGE = "USER_MESSAGE",
  ASSISTANT_MESSAGE = "ASSISTANT_MESSAGE",
  A2A_CALL = "A2A_CALL",
  A2A_RESPONSE = "A2A_RESPONSE",
  ERROR = "ERROR",
}

/**
 * Base event interface
 */
interface BaseEvent {
  id: string;
  conversationId: string;
  timestamp: string;
}

/**
 * User message event
 */
export interface UserMessageEvent extends BaseEvent {
  type: EventType.USER_MESSAGE;
  messageId: string;
  content: string;
}

/**
 * Assistant message event
 */
export interface AssistantMessageEvent extends BaseEvent {
  type: EventType.ASSISTANT_MESSAGE;
  messageId: string;
  content: string;
}

/**
 * A2A call event (task delegation)
 */
export interface A2ACallEvent extends BaseEvent {
  type: EventType.A2A_CALL;
  actionId: string; // Unique ID for this A2A call
  agentName: string;
  task: string;
}

/**
 * A2A response event (task completion)
 */
export interface A2AResponseEvent extends BaseEvent {
  type: EventType.A2A_RESPONSE;
  actionId: string; // References the A2A call
  agentName: string;
  task: string;
  result: string;
  durationMs?: number; // Time from call to response
  status: "success" | "error";
}

/**
 * Error event
 */
export interface ErrorEvent extends BaseEvent {
  type: EventType.ERROR;
  message: string;
  details?: string;
  relatedEventId?: string;
}

/**
 * Discriminated union of all event types
 */
export type Event =
  | UserMessageEvent
  | AssistantMessageEvent
  | A2ACallEvent
  | A2AResponseEvent
  | ErrorEvent;

/**
 * Helper to check if an event is a task (A2A call or response)
 */
export function isTaskEvent(event: Event): event is A2ACallEvent | A2AResponseEvent {
  return event.type === EventType.A2A_CALL || event.type === EventType.A2A_RESPONSE;
}
