import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { comparePassword, generateToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Validasi input
    if (!username || !password) {
      return NextResponse.json(
        { status: 'error', message: 'Username dan password harus diisi!' },
        { status: 400 }
      );
    }

    // Cari user di database
    const userResult = await pool.query(
      'SELECT id, username, password, angkatan FROM users WHERE username = $1',
      [username]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { status: 'error', message: 'Username atau password salah.' },
        { status: 401 }
      );
    }

    const user = userResult.rows[0];

    // Bandingkan password
    const isPasswordValid = comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { status: 'error', message: 'Username atau password salah.' },
        { status: 401 }
      );
    }

    // Buat token JWT
    const token = generateToken(user);

    return NextResponse.json({
      status: 'success',
      message: 'Login berhasil',
      user: {
        id: user.id,
        username: user.username,
        angkatan: user.angkatan
      },
      token
    });
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
