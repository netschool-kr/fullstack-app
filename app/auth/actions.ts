'use server';

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
// 'revalidatePath'를 임포트합니다.
import { revalidatePath } from 'next/cache';

export async function signUp(formData: FormData) {
  // ... (signUp 함수 코드는 이전 답변대로 `await` 적용)
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = await createClient(); // await 적용

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${new URL(process.env.NEXT_PUBLIC_SITE_URL!).origin}/auth/callback`,
    },
  });

  if (error) {
    console.error('Sign up error:', error.message);
    return redirect('/signup?message=Could not authenticate user');
  }

  return redirect('/signup/confirm');
}

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  // 'await'를 추가합니다.
  const supabase = await createClient();

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

export async function signOut() {
  // 'await'를 추가합니다.
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect('/');
}