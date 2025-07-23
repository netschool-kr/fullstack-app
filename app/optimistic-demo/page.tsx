import { OptimisticLikeButton } from '@/components/OptimisticLikeButton';

// 이 페이지에서 사용할 게시물의 타입을 정의합니다.
type Post = {
  id: string;
  title: string;
  isLiked: boolean;
  likes: number;
};

// 가상의 게시물 목록을 가져오는 비동기 함수입니다.
// 실제 애플리케이션에서는 데이터베이스에서 데이터를 조회합니다.
async function getInitialPosts(): Promise<Post[]> {
  return [
    { id: 'post-1', title: '첫 번째 게시물: 낙관적 UI', isLiked: false, likes: 15 },
    { id: 'post-2', title: '두 번째 게시물: 서버 액션', isLiked: true, likes: 42 },
    { id: 'post-3', title: '세 번째 게시물: 자동 롤백', isLiked: false, likes: 8 },
  ];
}

/**
 * 낙관적 UI 업데이트 데모를 위한 페이지 컴포넌트입니다.
 * 이 컴포넌트는 서버에서 실행되어 초기 게시물 데이터를 가져옵니다.
 */
export default async function OptimisticDemoPage() {
  const posts = await getInitialPosts();

  return (
    <main className="container mx-auto max-w-2xl p-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          낙관적 UI 업데이트 데모
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          '좋아요' 버튼을 클릭하여 `useOptimistic` 훅의 마법을 직접 경험해 보세요.
        </p>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-r-lg">
        <div className="flex">

          <div className="ml-2">
            <p className="text-sm text-yellow-700">
              버튼 클릭 시 UI는 즉시 반응하지만, 실제 서버 작업은 2초가 소요됩니다. 50% 확률로 의도적인 오류가 발생하여 UI가 자동으로 이전 상태로 되돌아가는 '자동 롤백' 기능을 확인할 수 있습니다.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <div 
            key={post.id} 
            className="flex items-center justify-between p-5 border rounded-xl shadow-sm bg-white transition-shadow hover:shadow-md"
          >
            <h2 className="text-xl font-semibold text-gray-800">{post.title}</h2>
            <OptimisticLikeButton
              postId={post.id}
              isLiked={post.isLiked}
              likes={post.likes}
            />
          </div>
        ))}
      </div>
    </main>
  );
}