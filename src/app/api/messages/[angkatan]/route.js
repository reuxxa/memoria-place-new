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

export async function GET(request, { params }) {
  try {
    // Verifikasi token
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthenticated.' },
        { status: 401 }
      );
    }

    // Await params karena di Next.js 15 params bersifat asynchronous
    const resolvedParams = await params;
    const { angkatan } = resolvedParams;

    if (!angkatan) {
      return NextResponse.json(
        { status: 'error', message: 'Parameter angkatan diperlukan' },
        { status: 400 }
      );
    }

    // Ambil pesan dari database
    const query = `
      SELECT m.id, m.text, m.angkatan, m.created_at, u.username
      FROM messages m
      LEFT JOIN users u ON m.user_id = u.id
      WHERE m.angkatan = $1
      ORDER BY m.created_at DESC
    `;
    const messagesResult = await pool.query(query, [angkatan.toString()]);

    const data = messagesResult.rows.map(row => ({
      id: row.id,
      text: row.text,
      angkatan: row.angkatan.toString(),
      username: row.username || 'Unknown',
      created_at: row.created_at,
      formatted_date: formatIndonesianDate(row.created_at)
    }));

    return NextResponse.json({
      status: 'success',
      data
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
