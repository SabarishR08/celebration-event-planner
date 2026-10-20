import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';
import { createEventSchema } from '@/lib/validations';

/**
 * GET /api/events - List all events for the authenticated user.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const sql = getDb();
    const events = await sql`
      SELECT * FROM events 
      WHERE user_id = ${user.userId} 
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    console.error('Get events error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch events' }, { status: 500 });
  }
}

/**
 * POST /api/events - Create a new event.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createEventSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const data = validation.data;
    const sql = getDb();

    const newEvent = await sql`
      INSERT INTO events (user_id, title, event_type, description, event_date, event_time, location, guest_count, budget, theme, notes)
      VALUES (${user.userId}, ${data.title}, ${data.event_type}, ${data.description || null}, ${data.event_date || null}, ${data.event_time || null}, ${data.location || null}, ${data.guest_count || 0}, ${data.budget || 0}, ${data.theme || null}, ${data.notes || null})
      RETURNING *
    `;

    return NextResponse.json(
      { success: true, data: newEvent[0], message: 'Event created successfully!' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create event' }, { status: 500 });
  }
}
