"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Conversation } from "@/types/conversation";

interface ConversationContextType {
  conversations: Conversation[];
  activeConversationId: string | null;
  loading: boolean;
  error: string | null;
  fetchConversations: () => Promise<void>;
  createConversation: () => Promise<Conversation | null>;
  setActiveConversation: (id: string | null) => void;
  getActiveConversation: () => Conversation | undefined;
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
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
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
      setActiveConversationId(newConversation.id);

      return newConversation;
    } catch (err) {
      console.error("Error creating conversation:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      return null;
    }
  }, []);

  /**
   * Set the active conversation
   */
  const setActiveConversation = useCallback((id: string | null) => {
    setActiveConversationId(id);
  }, []);

  /**
   * Get the currently active conversation object
   */
  const getActiveConversation = useCallback((): Conversation | undefined => {
    if (!activeConversationId) return undefined;
    return conversations.find((c) => c.id === activeConversationId);
  }, [activeConversationId, conversations]);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const value: ConversationContextType = {
    conversations,
    activeConversationId,
    loading,
    error,
    fetchConversations,
    createConversation,
    setActiveConversation,
    getActiveConversation,
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
