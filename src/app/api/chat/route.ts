import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';
import { chatMessageSchema, sanitizeInput } from '@/lib/validations';
import { generateAIResponse, type ChatMessage } from '@/lib/ai';
import { checkRateLimit } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit AI requests
    if (!checkRateLimit(`chat:${user.userId}`, 20, 60000)) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please wait a moment.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = chatMessageSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { message, eventId } = validation.data;
    const sanitizedMessage = sanitizeInput(message);
    const sql = getDb();

    // Build event context if eventId is provided
    let eventContext = '';
    if (eventId) {
      const events = await sql`SELECT * FROM events WHERE id = ${eventId} AND user_id = ${user.userId}`;
      if (events.length > 0) {
        const event = events[0];
        eventContext = `Event: ${event.title}\nType: ${event.event_type}\nDate: ${event.event_date || 'Not set'}\nLocation: ${event.location || 'Not set'}\nGuests: ${event.guest_count}\nBudget: $${event.budget}\nStatus: ${event.status}\nTheme: ${event.theme || 'Not set'}`;

        const vendors = await sql`SELECT name, category, status, estimated_cost FROM vendors WHERE event_id = ${eventId}`;
        if (vendors.length > 0) {
          eventContext += `\n\nVendors:\n${vendors.map((v: Record<string, unknown>) => `- ${v.name} (${v.category}): ${v.status} - $${v.estimated_cost}`).join('\n')}`;
        }

        const tasks = await sql`SELECT title, status, priority, due_date FROM tasks WHERE event_id = ${eventId}`;
        if (tasks.length > 0) {
          eventContext += `\n\nTasks:\n${tasks.map((t: Record<string, unknown>) => `- ${t.title}: ${t.status} (${t.priority})${t.due_date ? ` due ${t.due_date}` : ''}`).join('\n')}`;
        }
      }
    }

    // Get recent chat history for context
    const recentHistory = await sql`
      SELECT role, content FROM chat_history 
      WHERE user_id = ${user.userId} 
      ${eventId ? sql`AND event_id = ${eventId}` : sql`AND event_id IS NULL`}
      ORDER BY created_at DESC LIMIT 10
    `;

    const chatMessages: ChatMessage[] = recentHistory.reverse().map((msg: Record<string, string>) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));
    chatMessages.push({ role: 'user', content: sanitizedMessage });

    // Generate AI response
    const aiResponse = await generateAIResponse(chatMessages, eventContext);

    // Save messages to chat history
    await sql`
      INSERT INTO chat_history (user_id, event_id, role, content)
      VALUES (${user.userId}, ${eventId || null}, 'user', ${sanitizedMessage})
    `;
    await sql`
      INSERT INTO chat_history (user_id, event_id, role, content)
      VALUES (${user.userId}, ${eventId || null}, 'assistant', ${aiResponse})
    `;

    return NextResponse.json({
      success: true,
      data: {
        message: aiResponse,
        role: 'assistant',
      },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate response. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    const sql = getDb();
    const history = await sql`
      SELECT id, role, content, created_at FROM chat_history 
      WHERE user_id = ${user.userId}
      ${eventId ? sql`AND event_id = ${parseInt(eventId)}` : sql`AND event_id IS NULL`}
      ORDER BY created_at ASC
      LIMIT 50
    `;

    return NextResponse.json({ success: true, data: history });
  } catch (error) {
    console.error('Get chat history error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}
