import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';
import { generateStructuredTimeline } from '@/lib/ai';

async function verifyEventOwnership(userId: number, eventId: number) {
  const sql = getDb();
  const events = await sql`SELECT * FROM events WHERE id = ${eventId} AND user_id = ${userId}`;
  return events.length > 0 ? events[0] : null;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const eventId = parseInt(id);
    if (isNaN(eventId)) {
      return NextResponse.json({ success: false, error: 'Invalid event ID' }, { status: 400 });
    }

    const event = await verifyEventOwnership(user.userId, eventId);
    if (!event) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }

    // Generate structured timeline items using tuned AI model
    const milestones = await generateStructuredTimeline({
      title: event.title,
      event_type: event.event_type,
      guest_count: event.guest_count,
      location: event.location,
      theme: event.theme,
    });

    const sql = getDb();
    const insertedItems = [];

    for (const m of milestones) {
      const res = await sql`
        INSERT INTO timeline_items (event_id, title, description, start_time, category, sort_order)
        VALUES (${eventId}, ${m.title}, ${m.description}, ${m.start_time}, ${m.category}, ${m.sort_order})
        RETURNING *
      `;
      if (res.length > 0) {
        insertedItems.push(res[0]);
      }
    }

    return NextResponse.json({
      success: true,
      data: insertedItems,
      message: `Generated ${insertedItems.length} run-of-show milestones`,
    });
  } catch (error) {
    console.error('Auto-generate timeline error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate timeline' },
      { status: 500 }
    );
  }
}
