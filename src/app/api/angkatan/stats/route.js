import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  try {
    // Verifikasi token
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { status: 'error', message: 'Unauthenticated.' },
        { status: 401 }
      );
    }

    // Query statistik angkatan secara dinamis dari database
    const query = `
      SELECT u.angkatan, COUNT(m.id)::integer as count
      FROM (SELECT DISTINCT angkatan FROM users) u
      LEFT JOIN messages m ON m.angkatan = u.angkatan
      GROUP BY u.angkatan
      ORDER BY u.angkatan ASC
    `;
    const statsResult = await pool.query(query);

    // Pastikan nilai angkatan dikirim sebagai string
    const data = statsResult.rows.map(row => ({
      angkatan: row.angkatan.toString(),
      count: row.count
    }));

    return NextResponse.json({
      status: 'success',
      data
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
