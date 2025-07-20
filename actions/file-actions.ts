// app/actions/file-actions.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// 1. 서명된 업로드 URL 생성을 위한 서버 액션
export async function createSignedUploadUrl(fileInfo: {
  filename: string;
  contentType: string;
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
   .from('avatars')
   .createSignedUploadUrl(path);

  if (error) {
    console.error('Error creating signed upload URL:', error);
    return { failure: { error: error.message } };
  }

  return { success: { url: data.signedUrl, path: data.path, token: data.token } };
}

// Zod를 사용한 메타데이터 유효성 검사 스키마 (카멜케이스 속성 사용)
const fileMetadataSchema = z.object({
  pathInStorage: z.string(),
  originalFilename: z.string(),
});

// 2. 파일 메타데이터 저장을 위한 서버 액션
export async function saveFileMetadata(metadata: z.infer<typeof fileMetadataSchema>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { failure: { error: '인증되지 않은 사용자입니다.' } };
  }

  const validatedMetadata = fileMetadataSchema.safeParse(metadata);

  if (!validatedMetadata.success) {
    return { failure: { error: '유효하지 않은 메타데이터입니다.' } };
  }

  const { error } = await supabase.from('files').insert({
    path_in_storage: validatedMetadata.data.pathInStorage,
    original_filename: validatedMetadata.data.originalFilename,
    user_id: user.id,
  });

  if (error) {
    console.error('Error saving file metadata:', error);
    return { failure: { error: '메타데이터 저장에 실패했습니다.' } };
  }

  return { success: true };
}