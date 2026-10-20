import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';
import { createGuestSchema } from '@/lib/validations';

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
    const guests = await sql`SELECT * FROM guests WHERE event_id = ${eventId} ORDER BY name ASC`;
    const summary = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN rsvp_status = 'accepted' THEN 1 END) as accepted,
        COUNT(CASE WHEN rsvp_status = 'declined' THEN 1 END) as declined,
        COUNT(CASE WHEN rsvp_status = 'maybe' THEN 1 END) as maybe,
        COUNT(CASE WHEN rsvp_status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN plus_one THEN 1 END) as plus_ones
      FROM guests WHERE event_id = ${eventId}
    `;
    return NextResponse.json({ success: true, data: { guests, summary: summary[0] } });
  } catch (error) {
    console.error('Get guests error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch guests' }, { status: 500 });
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
    const validation = createGuestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.errors[0].message }, { status: 400 });
    }
    const data = validation.data;
    const sql = getDb();
    const guest = await sql`
      INSERT INTO guests (event_id, name, email, phone, rsvp_status, dietary_restrictions, plus_one, table_number)
      VALUES (${eventId}, ${data.name}, ${data.email || null}, ${data.phone || null}, ${data.rsvp_status || 'pending'}, ${data.dietary_restrictions || null}, ${data.plus_one || false}, ${data.table_number || null})
      RETURNING *
    `;
    return NextResponse.json({ success: true, data: guest[0] }, { status: 201 });
  } catch (error) {
    console.error('Create guest error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create guest' }, { status: 500 });
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
    const guestId = searchParams.get('guestId');
    if (!guestId) return NextResponse.json({ success: false, error: 'Guest ID required' }, { status: 400 });
    const sql = getDb();
    await sql`DELETE FROM guests WHERE id = ${parseInt(guestId)} AND event_id = ${eventId}`;
    return NextResponse.json({ success: true, message: 'Guest deleted' });
  } catch (error) {
    console.error('Delete guest error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete guest' }, { status: 500 });
  }
}
