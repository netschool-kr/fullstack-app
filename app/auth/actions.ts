'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // 이메일 확인을 위한 리디렉션 URL 지정
      emailRedirectTo: `${new URL(process.env.NEXT_PUBLIC_SITE_URL!).origin}/auth/callback`,
    },
  });

  if (error) {
    // TODO: 사용자에게 더 친절한 에러 메시지 표시
    console.error('Sign up error:', error.message);
    return redirect('/signup?message=Could not authenticate user');
  }

  // 성공 시 이메일 확인을 안내하는 페이지로 리디렉션
  return redirect('/signup/confirm');
}

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Sign in error:', error.message);
    return redirect('/login?message=Could not authenticate user');
  }

  // 성공 시 캐시를 무효화하고 보호된 페이지로 리디렉션
  revalidatePath('/', 'layout');
  return redirect('/dashboard');
}

// app/auth/actions.ts 에 추가
export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  return redirect('/');
}
