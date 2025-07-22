// app/posts/posts-list.tsx (클라이언트 컴포넌트)
'use client';

import { useQuery } from '@tanstack/react-query';
import { getPosts } from '@/queries/get-posts';

export default function PostsList() {
  // 3. useQuery는 서버에서 프리페칭된 데이터를 즉시 사용
  const { data: posts, isLoading, isError } = useQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
  });

  if (isLoading) return <div>로딩 중...</div>;
  if (isError) return <div>에러 발생!</div>;

  return (
    <ul>
      {posts?.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
