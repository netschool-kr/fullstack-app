import { createClient } from '@/utils/supabase/server';
import { SortableAttachmentList } from '@/components/SortableAttachmentList';

type PageProps = {
  params: Promise<{ postId: string }>;
};

// 특정 게시물의 첨부파일 목록을 가져오는 함수
async function getAttachments(postId: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('attachments')
    .select('id, file_path, "order"')
    .eq('post_id', postId)
    .order('"order"', { ascending: true });

  if (error) {
    console.error('Error fetching attachments:', error);
    return [];
  }
  return data;
}

export default async function SortableAttachmentsPage({ params }: PageProps) {
  const { postId: postIdStr } = await params;
  const postId = parseInt(postIdStr, 10);
  const initialItems = await getAttachments(postId);

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">첨부파일 순서 변경</h1>
      <p className="mb-4 text-gray-600">
        이미지를 드래그하여 순서를 변경하고, 페이지를 새로고침하여 순서가 유지되는지 확인해보세요.
      </p>
      <SortableAttachmentList initialItems={initialItems} postId={postId} />
    </main>
  );
}