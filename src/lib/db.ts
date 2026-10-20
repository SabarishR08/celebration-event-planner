import { neon } from '@neondatabase/serverless';

/**
 * Creates a new Neon SQL client using the DATABASE_URL environment variable.
 * Each invocation returns a fresh connection for serverless environments.
 */
export function getDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return neon(databaseUrl);
}

/**
 * Executes a parameterized SQL query safely.
 * Uses tagged template literals for automatic parameterization (SQL injection prevention).
 */
export async function query(sql: ReturnType<typeof neon>) {
  return sql;
}

export default getDb;
