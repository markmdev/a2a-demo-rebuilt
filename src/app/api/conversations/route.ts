import { NextRequest, NextResponse } from "next/server";
import { conversationStore } from "@/lib/conversationStore";

/**
 * GET /api/conversations
 * Returns all conversations
 */
export async function GET(request: NextRequest) {
  try {
    const conversations = conversationStore.getAll();
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/conversations
 * Creates a new conversation
 */
export async function POST(request: NextRequest) {
  try {
    const conversation = conversationStore.create();
    return NextResponse.json({ conversation }, { status: 201 });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
