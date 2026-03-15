import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { pin } = await request.json();
  const correctPin = process.env.APP_PIN || '1453';

  if (pin === correctPin) {
    const response = NextResponse.json({ success: true });
    // HTTP-only cookie ile oturum oluştur (7 gün geçerli)
    response.cookies.set('kitaprafim_auth', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    return response;
  }

  return NextResponse.json({ success: false, message: 'Yanlış PIN' }, { status: 401 });
}
