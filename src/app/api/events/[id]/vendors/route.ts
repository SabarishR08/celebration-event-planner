import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';
import { createVendorSchema, updateVendorSchema } from '@/lib/validations';

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
    const vendors = await sql`SELECT * FROM vendors WHERE event_id = ${eventId} ORDER BY created_at DESC`;
    return NextResponse.json({ success: true, data: vendors });
  } catch (error) {
    console.error('Get vendors error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch vendors' }, { status: 500 });
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
    const validation = createVendorSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.errors[0].message }, { status: 400 });
    }
    const data = validation.data;
    const sql = getDb();
    const vendor = await sql`
      INSERT INTO vendors (event_id, name, category, contact_email, contact_phone, estimated_cost, notes)
      VALUES (${eventId}, ${data.name}, ${data.category}, ${data.contact_email || null}, ${data.contact_phone || null}, ${data.estimated_cost || 0}, ${data.notes || null})
      RETURNING *
    `;
    return NextResponse.json({ success: true, data: vendor[0] }, { status: 201 });
  } catch (error) {
    console.error('Create vendor error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create vendor' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const { vendorId, ...updateData } = body;
    const validation = updateVendorSchema.safeParse(updateData);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.errors[0].message }, { status: 400 });
    }
    const data = validation.data;
    const sql = getDb();
    const updated = await sql`
      UPDATE vendors SET
        name = COALESCE(${data.name ?? null}, name),
        category = COALESCE(${data.category ?? null}, category),
        contact_email = COALESCE(${data.contact_email ?? null}, contact_email),
        contact_phone = COALESCE(${data.contact_phone ?? null}, contact_phone),
        estimated_cost = COALESCE(${data.estimated_cost ?? null}, estimated_cost),
        actual_cost = COALESCE(${data.actual_cost ?? null}, actual_cost),
        status = COALESCE(${data.status ?? null}, status),
        notes = COALESCE(${data.notes ?? null}, notes)
      WHERE id = ${vendorId} AND event_id = ${eventId}
      RETURNING *
    `;
    if (updated.length === 0) return NextResponse.json({ success: false, error: 'Vendor not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('Update vendor error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update vendor' }, { status: 500 });
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
    const vendorId = searchParams.get('vendorId');
    if (!vendorId) return NextResponse.json({ success: false, error: 'Vendor ID required' }, { status: 400 });
    const sql = getDb();
    await sql`DELETE FROM vendors WHERE id = ${parseInt(vendorId)} AND event_id = ${eventId}`;
    return NextResponse.json({ success: true, message: 'Vendor deleted' });
  } catch (error) {
    console.error('Delete vendor error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete vendor' }, { status: 500 });
  }
}
