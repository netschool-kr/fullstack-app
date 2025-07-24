'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { createSignedUploadUrlAction, saveAttachmentMetadataAction } from '@/actions/attachment-actions'; // 수정된 액션 임포트

type UploadButtonProps = {
  postId: number;
  onUploadSuccess: (newAttachment: any) => void; // SortableAttachmentList의 콜백
};

export default function UploadButton({ postId, onUploadSuccess }: UploadButtonProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 클라이언트 측 이미지 검증
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // 1. 서명된 URL 요청
      const signedUrlResult = await createSignedUploadUrlAction({
        filename: file.name,
        contentType: file.type,
        postId,
      });

      if (signedUrlResult.failure) {
        throw new Error(signedUrlResult.failure.error);
      }

      const { url, path, token } = signedUrlResult.success;

      // 2. 클라이언트에서 스토리지로 직접 업로드
      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from('attachments')
        .uploadToSignedUrl(path, token, file);

      if (uploadError) {
        throw new Error(`파일 업로드에 실패했습니다: ${uploadError.message}`);
      }

      // 3. 메타데이터 저장
      const metadataResult = await saveAttachmentMetadataAction({
        pathInStorage: path,
        originalFilename: file.name,
        mimeType: file.type,
        size: file.size,
        postId,
      });

      if (metadataResult.failure) {
        throw new Error(metadataResult.failure.error);
      }

      // 성공 시 콜백 호출 (새 첨부 객체 전달)
      onUploadSuccess(metadataResult.success.attachment);

      alert('파일 업로드 및 메타데이터 저장 성공!');
    } catch (e: any) {
      console.error(e);
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*" // 이미지 제한
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading && <p>업로드 중...</p>}
      {error && <p style={{ color: 'red' }}>오류: {error}</p>}
    </div>
  );
}