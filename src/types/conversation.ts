/**
 * Conversation metadata stored in-memory on the server
 */
export interface Conversation {
  id: string;
  name: string;
  threadId: string;
  createdAt: string;
  messageCount: number;
}
