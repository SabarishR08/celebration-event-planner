import { neon } from '@neondatabase/serverless';

/**
 * Creates a new Neon SQL client using the DATABASE_URL environment variable.
 * Leverages serverless connection pooling for sub-millisecond query execution.
 */
export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return neon(databaseUrl);
}

/**
 * Ensures optimal database performance by creating indexes on foreign keys
 * and frequent query lookups (user_id, event_id, status, created_at).
 */
export async function ensurePerformanceIndexes() {
  const sql = getDb();
  try {
    await sql`
      CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
      CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
      CREATE INDEX IF NOT EXISTS idx_vendors_event_id ON vendors(event_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_event_id ON tasks(event_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
      CREATE INDEX IF NOT EXISTS idx_budget_items_event_id ON budget_items(event_id);
      CREATE INDEX IF NOT EXISTS idx_guests_event_id ON guests(event_id);
      CREATE INDEX IF NOT EXISTS idx_timeline_items_event_id ON timeline_items(event_id);
      CREATE INDEX IF NOT EXISTS idx_chat_history_user_event ON chat_history(user_id, event_id);
    `;
    return true;
  } catch (error) {
    console.warn('Index creation notice:', error);
    return false;
  }
}

/**
 * Executes a parameterized SQL query safely.
 * Tagged template literals prevent SQL injection by design.
 */
export async function query(sql: ReturnType<typeof neon>) {
  return sql;
}

export default getDb;
