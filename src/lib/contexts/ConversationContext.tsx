"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Conversation, Message } from "@/types/conversation";

interface ConversationContextType {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  fetchConversations: () => Promise<void>;
  createConversation: () => Promise<Conversation | null>;
  fetchMessages: (conversationId: string) => Promise<Message[]>;
  addMessage: (conversationId: string, message: Message) => Promise<boolean>;
  upsertMessage: (conversationId: string, message: Message) => Promise<boolean>;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

/**
 * ConversationProvider
 *
 * Manages conversation state on the client side by fetching from the server API.
 * Provides methods to create, list, and switch between conversations.
 */
export function ConversationProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all conversations from the server
   */
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/conversations");

      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }

      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new conversation
   */
  const createConversation = useCallback(async (): Promise<Conversation | null> => {
    try {
      setError(null);
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to create conversation");
      }

      const data = await response.json();
      const newConversation = data.conversation;

      // Update local state
      setConversations((prev) => [newConversation, ...prev]);

      return newConversation;
    } catch (err) {
      console.error("Error creating conversation:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      return null;
    }
  }, []);

  /**
   * Fetch messages for a specific conversation
   */
  const fetchMessages = useCallback(async (conversationId: string): Promise<Message[]> => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`);

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();
      return data.messages || [];
    } catch (err) {
      console.error("Error fetching messages:", err);
      return [];
    }
  }, []);

  /**
   * Add a message to a conversation
   */
  const addMessage = useCallback(async (conversationId: string, message: Message): Promise<boolean> => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error("Failed to add message");
      }

      // Update the local conversation's messageCount
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId
            ? { ...conv, messageCount: conv.messageCount + 1 }
            : conv
        )
      );

      return true;
    } catch (err) {
      console.error("Error adding message:", err);
      return false;
    }
  }, []);

  /**
   * Upsert a message (add if new, update if exists)
   * Used for streaming messages where content updates over time
   */
  const upsertMessage = useCallback(async (conversationId: string, message: Message): Promise<boolean> => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message, upsert: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to upsert message");
      }

      const data = await response.json();

      // Update the local conversation's messageCount only if this was a new message
      if (data.isNewMessage) {
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversationId
              ? { ...conv, messageCount: conv.messageCount + 1 }
              : conv
          )
        );
      }

      return true;
    } catch (err) {
      console.error("Error upserting message:", err);
      return false;
    }
  }, []);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const value: ConversationContextType = {
    conversations,
    loading,
    error,
    fetchConversations,
    createConversation,
    fetchMessages,
    addMessage,
    upsertMessage,
  };

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
}

/**
 * useConversation hook
 *
 * Access conversation context from any component
 */
export function useConversation() {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error("useConversation must be used within a ConversationProvider");
  }
  return context;
}
