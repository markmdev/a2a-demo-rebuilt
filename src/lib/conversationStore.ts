import { Conversation } from "@/types/conversation";

/**
 * In-memory conversation store
 * Resets when server restarts (consistent with CopilotKit's in-memory message storage)
 */
class ConversationStore {
  private conversations: Map<string, Conversation> = new Map();
  private conversationCounter = 0;

  /**
   * Get all conversations sorted by creation date (newest first)
   */
  getAll(): Conversation[] {
    return Array.from(this.conversations.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Get a conversation by ID
   */
  get(id: string): Conversation | undefined {
    return this.conversations.get(id);
  }

  /**
   * Create a new conversation with auto-generated name
   */
  create(): Conversation {
    this.conversationCounter++;
    const id = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const threadId = `thread_${id}`;

    const conversation: Conversation = {
      id,
      name: `Conversation ${this.conversationCounter}`,
      threadId,
      createdAt: new Date().toISOString(),
      messageCount: 0,
    };

    this.conversations.set(id, conversation);
    return conversation;
  }

  /**
   * Update conversation metadata
   */
  update(id: string, updates: Partial<Omit<Conversation, "id" | "threadId">>): Conversation | null {
    const conversation = this.conversations.get(id);
    if (!conversation) return null;

    const updated = { ...conversation, ...updates };
    this.conversations.set(id, updated);
    return updated;
  }

  /**
   * Delete a conversation
   */
  delete(id: string): boolean {
    return this.conversations.delete(id);
  }
}

// Module-level singleton instance
export const conversationStore = new ConversationStore();
