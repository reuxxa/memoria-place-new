import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// Helper memformat tanggal ke Bahasa Indonesia (misal: "30 Mei 2026")
function formatIndonesianDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

export async function POST(request) {
  try {
    // Verifikasi token
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthenticated.' },
        { status: 401 }
      );
    }

    const { angkatan, text } = await request.json();

    // Validasi input
    if (!angkatan || !text || !text.trim()) {
      return NextResponse.json(
        { status: 'error', message: 'Kolom angkatan dan isi pesan tidak boleh kosong!' },
        { status: 400 }
      );
    }

    // Pastikan user hanya menulis di angkatannya sendiri
    if (user.angkatan.toString() !== angkatan.toString()) {
      return NextResponse.json(
        { status: 'error', message: 'Anda hanya dapat menulis pesan di kamar angkatan Anda sendiri!' },
        { status: 403 }
      );
    }

    // Simpan ke database
    const insertResult = await pool.query(
      'INSERT INTO messages (user_id, angkatan, text, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id, user_id, angkatan, text, created_at',
      [user.id, angkatan.toString(), text]
    );

    const message = insertResult.rows[0];

    return NextResponse.json({
      status: 'success',
      message: 'Pesan berhasil ditambahkan',
      data: {
        id: message.id,
        text: message.text,
        angkatan: message.angkatan.toString(),
        username: user.username,
        created_at: message.created_at,
        formatted_date: formatIndonesianDate(message.created_at)
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding message:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
