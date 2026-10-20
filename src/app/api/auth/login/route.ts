import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/db';
import { loginSchema } from '@/lib/validations';
import { createToken, getTokenCookieOptions } from '@/lib/auth';
import { checkRateLimit } from '@/lib/utils';

/**
 * POST /api/auth/login - Authenticate user and return JWT token.
 * Rate limited to prevent brute force attacks.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting - stricter for login
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(`login:${ip}`, 10, 60000)) {
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;
    const sql = getDb();

    // Find user by email
    const users = await sql`SELECT id, name, email, password_hash FROM users WHERE email = ${email}`;

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = await createToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      message: 'Login successful!',
    });

    // Set auth cookie
    response.cookies.set(getTokenCookieOptions(token));
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/login - Logout (clear auth cookie).
 */
export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully.',
  });
  response.cookies.delete('auth-token');
  return response;
}
