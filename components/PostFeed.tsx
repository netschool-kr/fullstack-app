// components/PostFeed.tsx
'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { PAGE_SIZE } from '@/actions/constants';
import { getPosts} from '@/actions/post-actions';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';

// Post 타입을 정의합니다 (실제 프로젝트에서는 더 상세하게 정의)
type Post = Awaited<ReturnType<typeof getPosts>>;

export function PostFeed({ initialPosts }: { initialPosts: Post }) {
  const { ref, inView } = useInView();

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: ({ pageParam }) => getPosts({ pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // 마지막 페이지의 데이터가 페이지 크기보다 작으면 더 이상 데이터가 없음
      if (lastPage.length < PAGE_SIZE) {
        return undefined;
      }
      // 다음 페이지 번호는 현재까지 로드된 페이지의 수
      return allPages.length;
    },
    // 서버에서 가져온 초기 데이터를 설정
    initialData: {
      pages: [initialPosts],
      pageParams: [0],
    },
  });

  useEffect(() => {
    // ref 요소가 보이고, 다음 페이지가 있으며, 현재 로딩 중이 아닐 때
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage, isFetchingNextPage]);

  const posts = data?.pages.flatMap((page) => page) ?? [];

  return (
    <div>
      <ul className="space-y-4">
        {posts.map((post) => (
          <li key={post.id} className="p-4 border rounded-lg shadow-sm">
            <p className="font-bold">{post.profiles?.username}</p>
            <p>{post.title}</p>
          </li>
        ))}
      </ul>

      {/* 다음 페이지 로드를 트리거할 요소 */}
      <div ref={ref} className="h-10">
        {isFetchingNextPage && <p>로딩 중...</p>}
        {!hasNextPage && posts.length > 0 && <p>모든 게시물을 불러왔습니다.</p>}
      </div>
      {error && <p className="text-red-500">오류가 발생했습니다: {error.message}</p>}
    </div>
  );
}