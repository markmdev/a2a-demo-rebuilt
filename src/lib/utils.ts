/**
 * Utility functions for the A2A Demo application
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with proper precedence
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Generate a unique event ID
 * @returns Event ID with format: evt_{timestamp}_{random}
 */
export function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a unique conversation ID
 * @returns Conversation ID with format: conv_{timestamp}_{random}
 */
export function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a unique thread ID from a conversation ID
 * @param conversationId - The conversation ID to generate a thread ID for
 * @returns Thread ID with format: thread_{conversationId}
 */
export function generateThreadId(conversationId: string): string {
  return `thread_${conversationId}`;
}

/**
 * Generate a unique action ID for A2A calls
 * @returns Action ID with format: a2a_{timestamp}_{random}
 */
export function generateActionId(): string {
  return `a2a_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format date as relative time (e.g., "2 minutes ago", "1 hour ago")
 */
export function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths}mo ago`;
}
