import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';
import { updateEventSchema } from '@/lib/validations';

/**
 * GET /api/events/[id] - Get a specific event with all related data.
 */
export async function GET(
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

    const sql = getDb();

    // Fetch event with ownership check
    const events = await sql`
      SELECT * FROM events WHERE id = ${eventId} AND user_id = ${user.userId}
    `;

    if (events.length === 0) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }

    // Fetch related data
    const vendors = await sql`SELECT * FROM vendors WHERE event_id = ${eventId} ORDER BY created_at DESC`;
    const tasks = await sql`SELECT * FROM tasks WHERE event_id = ${eventId} ORDER BY due_date ASC NULLS LAST`;
    const budgetItems = await sql`SELECT * FROM budget_items WHERE event_id = ${eventId} ORDER BY created_at DESC`;
    const guests = await sql`SELECT * FROM guests WHERE event_id = ${eventId} ORDER BY name ASC`;
    const timeline = await sql`SELECT * FROM timeline_items WHERE event_id = ${eventId} ORDER BY sort_order ASC`;

    return NextResponse.json({
      success: true,
      data: {
        event: events[0],
        vendors,
        tasks,
        budgetItems,
        guests,
        timeline,
      },
    });
  } catch (error) {
    console.error('Get event error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch event' }, { status: 500 });
  }
}

/**
 * PATCH /api/events/[id] - Update an event.
 */
export async function PATCH(
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

    const body = await request.json();
    const validation = updateEventSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const sql = getDb();

    // Check ownership
    const existing = await sql`SELECT id FROM events WHERE id = ${eventId} AND user_id = ${user.userId}`;
    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }

    const data = validation.data;
    const updated = await sql`
      UPDATE events SET
        title = COALESCE(${data.title ?? null}, title),
        event_type = COALESCE(${data.event_type ?? null}, event_type),
        description = COALESCE(${data.description ?? null}, description),
        event_date = COALESCE(${data.event_date ?? null}, event_date),
        event_time = COALESCE(${data.event_time ?? null}, event_time),
        location = COALESCE(${data.location ?? null}, location),
        guest_count = COALESCE(${data.guest_count ?? null}, guest_count),
        budget = COALESCE(${data.budget ?? null}, budget),
        status = COALESCE(${data.status ?? null}, status),
        theme = COALESCE(${data.theme ?? null}, theme),
        notes = COALESCE(${data.notes ?? null}, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${eventId} AND user_id = ${user.userId}
      RETURNING *
    `;

    return NextResponse.json({ success: true, data: updated[0], message: 'Event updated successfully!' });
  } catch (error) {
    console.error('Update event error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update event' }, { status: 500 });
  }
}

/**
 * DELETE /api/events/[id] - Delete an event and all related data.
 */
export async function DELETE(
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

    const sql = getDb();
    const deleted = await sql`
      DELETE FROM events WHERE id = ${eventId} AND user_id = ${user.userId} RETURNING id
    `;

    if (deleted.length === 0) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Event deleted successfully!' });
  } catch (error) {
    console.error('Delete event error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete event' }, { status: 500 });
  }
}
