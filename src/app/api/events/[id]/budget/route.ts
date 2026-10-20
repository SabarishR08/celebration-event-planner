import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';
import { createBudgetItemSchema } from '@/lib/validations';

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
    const items = await sql`SELECT * FROM budget_items WHERE event_id = ${eventId} ORDER BY created_at DESC`;
    const summary = await sql`
      SELECT 
        COALESCE(SUM(estimated_amount), 0) as total_estimated,
        COALESCE(SUM(actual_amount), 0) as total_actual,
        COUNT(*) as item_count,
        COUNT(CASE WHEN is_paid THEN 1 END) as paid_count
      FROM budget_items WHERE event_id = ${eventId}
    `;
    return NextResponse.json({ success: true, data: { items, summary: summary[0] } });
  } catch (error) {
    console.error('Get budget error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch budget' }, { status: 500 });
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
    const validation = createBudgetItemSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.errors[0].message }, { status: 400 });
    }
    const data = validation.data;
    const sql = getDb();
    const item = await sql`
      INSERT INTO budget_items (event_id, category, description, estimated_amount, actual_amount, is_paid)
      VALUES (${eventId}, ${data.category}, ${data.description || null}, ${data.estimated_amount || 0}, ${data.actual_amount || null}, ${data.is_paid || false})
      RETURNING *
    `;
    return NextResponse.json({ success: true, data: item[0] }, { status: 201 });
  } catch (error) {
    console.error('Create budget item error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create budget item' }, { status: 500 });
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
    await sql`DELETE FROM budget_items WHERE id = ${parseInt(itemId)} AND event_id = ${eventId}`;
    return NextResponse.json({ success: true, message: 'Budget item deleted' });
  } catch (error) {
    console.error('Delete budget item error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete budget item' }, { status: 500 });
  }
}
