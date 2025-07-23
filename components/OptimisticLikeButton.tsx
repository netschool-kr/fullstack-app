// components/OptimisticLikeButton.tsx
'use client';

import { useOptimistic, startTransition } from 'react';
import { toggleLikeAction } from '@/actions/post-actions';

type LikeButtonProps = {
  postId: string;
  isLiked: boolean;
  likes: number;
};

export function OptimisticLikeButton({ postId, isLiked, likes }: LikeButtonProps) {
  const [optimisticState, addOptimistic] = useOptimistic(
    { isLiked, likes },
    (currentState, action: 'toggle') => {
      // 낙관적 업데이트 로직: 현재 상태를 기반으로 다음 상태를 계산
      return {
        isLiked:!currentState.isLiked,
        likes: currentState.isLiked? currentState.likes - 1 : currentState.likes + 1,
      };
    }
  );

  const handleAction = async () => {
    // 1. 낙관적 상태 업데이트 즉시 실행
    startTransition(() => {
      addOptimistic('toggle');
    });
    
    try {
      // 2. 실제 서버 액션은 백그라운드에서 실행
      await toggleLikeAction(postId, optimisticState.isLiked);
    } catch (error) {
      // 서버 액션이 실패하면 useOptimistic 훅이 자동으로 롤백하므로
      // 여기서 별도의 UI 롤백 로직을 작성할 필요가 없습니다.
      console.error("Like action failed, UI will be reverted.");
    }
  };

  return (
    <form action={handleAction}>
      <button type="submit" className="flex items-center space-x-2 p-2 rounded-lg transition-colors duration-200 bg-gray-100 hover:bg-gray-200">
        <span className={`text-2xl ${optimisticState.isLiked? 'text-red-500' : 'text-gray-400'}`}>
          {optimisticState.isLiked? '❤️' : '🤍'}
        </span>
        <span className="font-semibold text-lg">{optimisticState.likes}</span>
      </button>
    </form>
  );
}
