// components/file-uploader.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { createSignedUploadUrl, saveFileMetadata } from '@/actions/file-actions';

export default function FileUploader() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      // 1. 서명된 URL 요청
      const signedUrlResult = await createSignedUploadUrl({
        filename: file.name,
        contentType: file.type,
      });

      if (signedUrlResult.failure) {
        throw new Error(signedUrlResult.failure.error);
      }

      const { path, token } = signedUrlResult.success;

      // 2. 클라이언트에서 스토리지로 직접 업로드
      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
       .from('avatars')
       .uploadToSignedUrl(path, token, file);

      if (uploadError) {
        throw new Error('파일 업로드에 실패했습니다.');
      }

      // 3. 메타데이터 저장 (mimeType과 size 제거)
      const metadataResult = await saveFileMetadata({
        pathInStorage: path,
        originalFilename: file.name,
      });

      if (metadataResult.failure) {
        // 여기서 트랜잭션 문제 발생 가능! (아래 설명 참조)
        throw new Error(metadataResult.failure.error);
      }

      alert('파일 업로드 및 메타데이터 저장 성공!');
    } catch (e: unknown) {
      console.error(e);
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading && <p>업로드 중...</p>}
      {error && <p style={{ color: 'red' }}>오류: {error}</p>}
    </div>
  );
}