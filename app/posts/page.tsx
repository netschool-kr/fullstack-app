// app/posts/posts.tsx (클라이언트 컴포넌트)

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { getPosts } from '@/app/queries/get-posts';

import PostsList from './posts-list'; // 클라이언트 컴포넌트

export default async function PostsPage() {
  const queryClient = new QueryClient();

  // 1. 서버에서 데이터 프리페칭
  await queryClient.prefetchQuery({
    queryKey: ['posts'],
    queryFn: getPosts,
  });

  return (
    // 2. HydrationBoundary로 클라이언트 컴포넌트를 감싸고 직렬화된 상태 전달
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PostsList />
    </HydrationBoundary>
  );
}
