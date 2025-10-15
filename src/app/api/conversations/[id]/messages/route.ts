import { NextRequest, NextResponse } from "next/server";
import { conversationStore } from "@/lib/conversationStore";
import { Message } from "@/types/conversation";

/**
 * GET /api/conversations/[id]/messages
 * Returns all messages for a conversation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const messages = conversationStore.getMessages(id);

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/conversations/[id]/messages
 * Adds or upserts a message to a conversation
 *
 * Body:
 * - { message: Message, upsert?: boolean } - Single message (add or upsert)
 * - { messages: Message[] } - Multiple messages (always adds)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Support both single message and multiple messages
    if (body.messages && Array.isArray(body.messages)) {
      const success = conversationStore.addMessages(id, body.messages);
      if (!success) {
        return NextResponse.json(
          { error: "Conversation not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, count: body.messages.length });
    } else if (body.message) {
      // Use upsert if requested (for streaming messages), otherwise add
      const success = body.upsert
        ? conversationStore.upsertMessage(id, body.message)
        : conversationStore.addMessage(id, body.message);

      if (!success) {
        return NextResponse.json(
          { error: "Conversation not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, message: body.message });
    } else {
      return NextResponse.json(
        { error: "Invalid request body. Expected 'message' or 'messages' field" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error adding message:", error);
    return NextResponse.json(
      { error: "Failed to add message" },
      { status: 500 }
    );
  }
}
