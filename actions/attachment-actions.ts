// actions/attachment-actions.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';


// Define Attachment type
type Attachment = {
  id: number;
  file_path: string;
  order: number;
};

type AttachmentOrderUpdate = {
  id: number;
  new_order: number;
};

export async function updateAttachmentOrderAction(
  items: AttachmentOrderUpdate[],
  postId: number // 어떤 게시물의 첨부파일인지 식별하기 위해 필요
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Authentication required');
  }

  // 데이터베이스 함수(RPC) 호출
  const { error } = await supabase.rpc('update_attachments_order', {
    items_to_update: items,
  });

  if (error) {
    console.error('Error updating attachment order:', error);
    throw new Error('Failed to update attachment order.');
  }

  // 성공 시 관련 게시물 페이지의 캐시 무효화
  revalidatePath(`/posts/${postId}`);
  return { success: true };
}

// 서명된 업로드 URL 생성을 위한 서버 액션
export async function createSignedUploadUrlAction(fileInfo: {
  filename: string;
  contentType: string;
  postId: number; // postId 추가
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { failure: { error: '인증되지 않은 사용자입니다.' } };
  }

  // 파일 확장자 추출
  const fileExtension = fileInfo.filename.split('.').pop();
  // 고유한 파일 경로 생성 (사용자ID/UUID.확장자)
  const path = `${user.id}/${uuidv4()}.${fileExtension}`;

  const { data, error } = await supabase.storage
    .from('attachments')
    .createSignedUploadUrl(path);

  if (error) {
    console.error('Error creating signed upload URL:', error);
    return { failure: { error: error.message } };
  }

  return { success: { url: data.signedUrl, path: data.path, token: data.token, postId: fileInfo.postId } };
}

// Zod를 사용한 메타데이터 유효성 검사 스키마
const attachmentMetadataSchema = z.object({
  pathInStorage: z.string(),
  originalFilename: z.string(),
  mimeType: z.string(),
  size: z.number(),
  postId: z.number(), // postId 추가
});

// 파일 메타데이터 저장을 위한 서버 액션
export async function saveAttachmentMetadataAction(metadata: z.infer<typeof attachmentMetadataSchema>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { failure: { error: '인증되지 않은 사용자입니다.' } };
  }

  const validatedMetadata = attachmentMetadataSchema.safeParse(metadata);

  if (!validatedMetadata.success) {
    return { failure: { error: '유효하지 않은 메타데이터입니다.' } };
  }

  // 전체 공개 URL 생성
  const { data: { publicUrl } } = supabase.storage.from('attachments').getPublicUrl(validatedMetadata.data.pathInStorage);

  // 현재 첨부파일 개수 조회하여 다음 order 계산
  const { count, error: countError } = await supabase
    .from('attachments')
    .select('id', { count: 'exact', head: true })
    .eq('post_id', validatedMetadata.data.postId);

  if (countError) {
    return { failure: { error: `개수 조회 실패: ${countError.message}` } };
  }

  const nextOrder = count ?? 0;

  // attachments 테이블에 삽입
  const { data: insertData, error } = await supabase
    .from('attachments')
    .insert({
      post_id: validatedMetadata.data.postId,
      file_path: publicUrl, // 전체 URL 저장
      order: nextOrder,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving attachment metadata:', error);
    return { failure: { error: '메타데이터 저장에 실패했습니다.' } };
  }

  revalidatePath(`/posts/${validatedMetadata.data.postId}`);
  return { success: { attachment: insertData } }; // 새 첨부 객체 반환 (onUploadSuccess용)
}