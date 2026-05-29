import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { username, password, angkatan } = await request.json();

    // Validasi input
    if (!username || !password || !angkatan) {
      return NextResponse.json(
        { status: 'error', message: 'Semua kolom (username, password, angkatan) harus diisi!' },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { status: 'error', message: 'Username minimal harus 3 karakter!' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { status: 'error', message: 'Password minimal harus 6 karakter!' },
        { status: 400 }
      );
    }

    // Cek keunikan username
    const checkUser = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (checkUser.rows.length > 0) {
      return NextResponse.json(
        { status: 'error', message: 'Username sudah digunakan oleh pengguna lain!' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = hashPassword(password);

    // Simpan ke database
    const insertResult = await pool.query(
      'INSERT INTO users (username, password, angkatan, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id, username, angkatan',
      [username, hashedPassword, angkatan.toString()]
    );

    const user = insertResult.rows[0];
    const token = generateToken(user);

    return NextResponse.json(
      {
        status: 'success',
        message: 'Registrasi berhasil',
        user: {
          id: user.id,
          username: user.username,
          angkatan: user.angkatan
        },
        token
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error during register:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
