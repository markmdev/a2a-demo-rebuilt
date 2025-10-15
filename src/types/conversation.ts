/**
 * Message in a conversation
 * Compatible with CopilotKit's Message format for initialMessages
 */
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

/**
 * Conversation metadata stored in-memory on the server
 */
export interface Conversation {
  id: string;
  name: string;
  threadId: string;
  createdAt: string;
  messageCount: number;
  messages: Message[];
}
