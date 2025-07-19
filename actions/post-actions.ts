// app/actions/post-actions.ts (서버 액션)
'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createPost(formData: FormData) {
  const supabase = await createClient();
  const title = formData.get('title') as string;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase.from('posts').insert({ title, user_id: user.id });

  if (error) {
    console.error('Error creating post:', error);
    throw new Error('Failed to create post');
  }

  // 서버 컴포넌트의 데이터 캐시를 무효화
  revalidatePath('/posts');

  return { success: true };
}


