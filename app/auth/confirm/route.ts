// app/auth/confirm/route.ts
import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;

  if (token_hash && type) {
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      // 인증 성공 시 로그인 페이지로 리디렉션
      return redirect('/login?message=Email confirmed successfully. You can now log in.');
    }
  }

  // 인증 실패 시 에러 페이지로 리디렉션
  console.error('Email confirmation error');
  return redirect('/login?message=Error confirming email. Please try again.');
}
