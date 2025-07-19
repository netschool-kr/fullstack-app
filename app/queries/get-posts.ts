// queries/get-posts.ts

import { createClient } from '@/utils/supabase/client';

// 게시물 데이터의 타입을 정의합니다.
// 실제 데이터베이스 컬럼에 맞게 확장할 수 있습니다.
export interface Post {
  id: number;
  created_at: string;
  title: string;
  user_id: string;
}

/**
 * Supabase에서 모든 게시물 목록을 가져오는 함수
 * @returns 게시물 배열 (Promise)
 */
export async function getPosts(): Promise<Post[]> {
  const supabase = createClient();

  // 'posts' 테이블에서 모든 데이터를 생성일 기준 내림차순으로 조회
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    // 에러 발생 시, 에러를 던져 React Query가 isError 상태를 true로 만들게 함
    throw new Error(error.message);
  }

  // 데이터가 null일 경우를 대비해 빈 배열을 반환
  return data || [];
}