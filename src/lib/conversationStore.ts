import { Conversation, Message } from "@/types/conversation";

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
      messages: [],
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

  /**
   * Get all messages for a conversation
   */
  getMessages(id: string): Message[] {
    const conversation = this.conversations.get(id);
    return conversation?.messages || [];
  }

  /**
   * Add a message to a conversation
   * Automatically updates messageCount
   */
  addMessage(id: string, message: Message): boolean {
    const conversation = this.conversations.get(id);
    if (!conversation) return false;

    conversation.messages.push(message);
    conversation.messageCount = conversation.messages.length;

    return true;
  }

  /**
   * Add multiple messages to a conversation
   */
  addMessages(id: string, messages: Message[]): boolean {
    const conversation = this.conversations.get(id);
    if (!conversation) return false;


    messages.forEach((message) => {
      conversation.messages.push(message);
    });

    conversation.messageCount = conversation.messages.length;
    return true;
  }

  /**
   * Upsert a message (add if new, update if exists)
   * Handles streaming messages where content updates over time
   */
  upsertMessage(id: string, message: Message): boolean {
    const conversation = this.conversations.get(id);
    if (!conversation) return false;

    // Find existing message by ID
    const existingIndex = conversation.messages.findIndex(m => m.id === message.id);

    if (existingIndex >= 0) {
      // Update existing message
      conversation.messages[existingIndex] = message;
    } else {
      // Add new message
      conversation.messages.push(message);
    }

    conversation.messageCount = conversation.messages.length;
    return true;
  }
}

// Singleton pattern for HMR survival in development
// This prevents losing conversations during Fast Refresh/HMR
// Still resets on server restart (as intended)
declare global {
  // eslint-disable-next-line no-var
  var __conversationStore: ConversationStore | undefined;
}

export const conversationStore = globalThis.__conversationStore ??= new ConversationStore();
