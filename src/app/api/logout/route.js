import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json(
      { status: 'error', message: 'Unauthenticated.' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    status: 'success',
    message: 'Logout berhasil'
  });
}
