// queries/use-posts.ts
'use server'
import { useQuery } from '@supabase-cache-helpers/postgrest-react-query';
import { createClient } from '@/utils/supabase/client'; // 클라이언트 컴포넌트용 Supabase 클라이언트

// 모든 게시물을 가져오는 커스텀 훅
export const usePosts = () => {
  const supabase = createClient();
  // Supabase 쿼리 자체가 쿼리 키로 사용됨
  return useQuery(
    supabase.from('posts').select('*').order('created_at', { ascending: false })
  );
};

// 특정 ID의 게시물 하나를 가져오는 커스텀 훅
export const usePost = (id: number) => {
  const supabase = createClient();
  return useQuery(
    supabase.from('posts').select('*').eq('id', id).single(),
    {
      enabled:!!id, // id가 존재할 때만 쿼리 실행
    }
  );
};
