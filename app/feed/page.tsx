// app/feed/page.tsx
import { getPosts } from '@/actions/post-actions';
import { PostFeed } from '@/components/PostFeed';

export default async function FeedPage() {
  // 서버에서 첫 페이지 데이터를 미리 가져옴
  const initialPosts = await getPosts({ pageParam: 0 });

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">최신 피드</h1>
      <PostFeed initialPosts={initialPosts} />
    </main>
  );
}
