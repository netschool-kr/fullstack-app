// actions/post-actions.ts (서버 액션)
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


// 가상의 데이터베이스 함수
async function updatePostLikeStatus(postId: string, newLikeStatus: boolean) {
  console.log(`Post ${postId}의 좋아요 상태를 ${newLikeStatus}로 업데이트`);
  // 2초 지연 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 2000));
  
  // 50% 확률로 의도적 오류 발생 (롤백 테스트용)
  if (Math.random() > 0.5) {
    console.error('DB 업데이트 실패!');
    throw new Error('Database update failed');
  }
  
  // 실제 DB 업데이트 로직...
}

export async function toggleLikeAction(postId: string, isLiked: boolean) {
  try {
    await updatePostLikeStatus(postId,!isLiked);
  } catch (error) {
    console.error(error);
    // 실패 시 revalidate를 호출하지 않고 에러를 다시 던져
    // useOptimistic 훅이 롤백을 수행하도록 함
    throw error;
  }
  
  revalidatePath(`/posts/${postId}`);
}
