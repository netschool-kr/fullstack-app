
// components/new-post-form.tsx (클라이언트 컴포넌트)
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPost } from '@/actions/post-actions';

export default function NewPostForm() {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: createPost, // 서버 액션을 mutation 함수로 전달
    onSuccess: () => {
      console.log('게시물 생성 성공!');
      // 'posts' 쿼리 키를 가진 모든 쿼리를 무효화하여 다시 가져오도록 함
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error) => {
      console.error('게시물 생성 실패:', error.message);
      alert('게시물 생성에 실패했습니다.');
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    mutate(formData);
    event.currentTarget.reset(); // 폼 초기화
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="title" placeholder="게시물 제목" required disabled={isPending} />
      <button type="submit" disabled={isPending}>
        {isPending? '생성 중...' : '게시물 생성'}
      </button>
    </form>
  );
}
