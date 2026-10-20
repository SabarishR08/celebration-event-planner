import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';
import { createTimelineItemSchema } from '@/lib/validations';

async function verifyEventOwnership(userId: number, eventId: number) {
  const sql = getDb();
  const events = await sql`SELECT id FROM events WHERE id = ${eventId} AND user_id = ${userId}`;
  return events.length > 0;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUserFromRequest(request);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const eventId = parseInt(id);
    if (isNaN(eventId)) return NextResponse.json({ success: false, error: 'Invalid event ID' }, { status: 400 });
    if (!(await verifyEventOwnership(user.userId, eventId))) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }
    const sql = getDb();
    const items = await sql`SELECT * FROM timeline_items WHERE event_id = ${eventId} ORDER BY sort_order ASC, start_time ASC NULLS LAST`;
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error('Get timeline error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch timeline' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUserFromRequest(request);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const eventId = parseInt(id);
    if (isNaN(eventId)) return NextResponse.json({ success: false, error: 'Invalid event ID' }, { status: 400 });
    if (!(await verifyEventOwnership(user.userId, eventId))) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }
    const body = await request.json();
    const validation = createTimelineItemSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.errors[0].message }, { status: 400 });
    }
    const data = validation.data;
    const sql = getDb();
    const item = await sql`
      INSERT INTO timeline_items (event_id, title, description, start_time, end_time, category, sort_order)
      VALUES (${eventId}, ${data.title}, ${data.description || null}, ${data.start_time || null}, ${data.end_time || null}, ${data.category || null}, ${data.sort_order || 0})
      RETURNING *
    `;
    return NextResponse.json({ success: true, data: item[0] }, { status: 201 });
  } catch (error) {
    console.error('Create timeline item error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create timeline item' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUserFromRequest(request);
    if (!user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const eventId = parseInt(id);
    if (isNaN(eventId)) return NextResponse.json({ success: false, error: 'Invalid event ID' }, { status: 400 });
    if (!(await verifyEventOwnership(user.userId, eventId))) {
      return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    }
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    if (!itemId) return NextResponse.json({ success: false, error: 'Item ID required' }, { status: 400 });
    const sql = getDb();
    await sql`DELETE FROM timeline_items WHERE id = ${parseInt(itemId)} AND event_id = ${eventId}`;
    return NextResponse.json({ success: true, message: 'Timeline item deleted' });
  } catch (error) {
    console.error('Delete timeline item error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete timeline item' }, { status: 500 });
  }
}
