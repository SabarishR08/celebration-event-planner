import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getAuthUserFromRequest } from '@/lib/auth';
import { createTaskSchema, updateTaskSchema } from '@/lib/validations';

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
    const tasks = await sql`SELECT * FROM tasks WHERE event_id = ${eventId} ORDER BY CASE priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 WHEN 'low' THEN 4 END, due_date ASC NULLS LAST`;
    return NextResponse.json({ success: true, data: tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch tasks' }, { status: 500 });
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
    const validation = createTaskSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.errors[0].message }, { status: 400 });
    }
    const data = validation.data;
    const sql = getDb();
    const task = await sql`
      INSERT INTO tasks (event_id, title, description, due_date, priority, assigned_to)
      VALUES (${eventId}, ${data.title}, ${data.description || null}, ${data.due_date || null}, ${data.priority || 'medium'}, ${data.assigned_to || null})
      RETURNING *
    `;
    return NextResponse.json({ success: true, data: task[0] }, { status: 201 });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create task' }, { status: 500 });
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
    const { taskId, ...updateData } = body;
    const validation = updateTaskSchema.safeParse(updateData);
    if (!validation.success) {
      return NextResponse.json({ success: false, error: validation.error.errors[0].message }, { status: 400 });
    }
    const data = validation.data;
    const sql = getDb();
    const updated = await sql`
      UPDATE tasks SET
        title = COALESCE(${data.title ?? null}, title),
        description = COALESCE(${data.description ?? null}, description),
        due_date = COALESCE(${data.due_date ?? null}, due_date),
        priority = COALESCE(${data.priority ?? null}, priority),
        status = COALESCE(${data.status ?? null}, status),
        assigned_to = COALESCE(${data.assigned_to ?? null}, assigned_to)
      WHERE id = ${taskId} AND event_id = ${eventId}
      RETURNING *
    `;
    if (updated.length === 0) return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error('Update task error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update task' }, { status: 500 });
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
    const taskId = searchParams.get('taskId');
    if (!taskId) return NextResponse.json({ success: false, error: 'Task ID required' }, { status: 400 });
    const sql = getDb();
    await sql`DELETE FROM tasks WHERE id = ${parseInt(taskId)} AND event_id = ${eventId}`;
    return NextResponse.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    console.error('Delete task error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete task' }, { status: 500 });
  }
}
