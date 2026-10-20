import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { registerSchema } from '@/lib/validations';
import { createToken, getTokenCookieOptions } from '@/lib/auth';
import { checkRateLimit } from '@/lib/utils';

/**
 * POST /api/auth/register - Register a new user account.
 * Rate limited to prevent abuse.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(`register:${ip}`, 5, 60000)) {
      return NextResponse.json(
        { success: false, error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = validation.data;
    const sql = getDb();

    // Check if user already exists
    const existingUsers = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existingUsers.length > 0) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    // Hash password with bcrypt (cost factor 12)
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await sql`
      INSERT INTO users (name, email, password_hash)
      VALUES (${name}, ${email}, ${passwordHash})
      RETURNING id, name, email, created_at
    `;

    // Generate JWT token
    const token = await createToken({
      userId: newUser[0].id,
      email: newUser[0].email,
      name: newUser[0].name,
    });

    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: newUser[0].id,
            name: newUser[0].name,
            email: newUser[0].email,
          },
        },
        message: 'Account created successfully!',
      },
      { status: 201 }
    );

    // Set auth cookie
    response.cookies.set(getTokenCookieOptions(token));
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
