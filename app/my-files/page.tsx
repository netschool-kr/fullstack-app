// app/my-files/page.tsx (클라이언트 컴포넌트로 변경)
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client'; // 클라이언트 측 Supabase 클라이언트 임포트 (표준 Supabase 설정 가정)
import { createSignedUploadUrl, saveFileMetadata } from '@/actions/file-actions'; // 서버 액션 임포트 (경로에 따라 조정)
import { User } from '@supabase/supabase-js'; // Supabase User 타입 임포트

// 파일 메타데이터와 서명된 URL을 함께 담을 타입
type FileWithSignedUrl = {
  id: string;
  original_filename: string | null;
  signedUrl: string;
};

// createSignedUploadUrl의 반환 타입 정의
type UploadUrlResponse =
  | { success: { url: string; path: string; token: string } }
  | { failure: { error: string } };

// saveFileMetadata의 반환 타입 정의
type SaveMetadataResponse =
  | { success: boolean }
  | { failure: { error: string } };

export default function MyFilesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [filesWithSignedUrls, setFilesWithSignedUrls] = useState<FileWithSignedUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function loadUserAndFiles() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (!user) {
        setError('로그인이 필요합니다.');
        setLoading(false);
        return;
      }

      // 1. RLS 정책에 따라 현재 사용자의 파일 메타데이터만 조회
      const { data: files, error: filesError } = await supabase
        .from('files')
        .select('id, path_in_storage, original_filename')
        .eq('user_id', user.id);

      if (filesError) {
        setError('파일 목록을 불러오는 데 실패했습니다.');
        setLoading(false);
        return;
      }

      // 2. 각 파일에 대해 서명된 URL 생성
      const filesWithSignedUrls: FileWithSignedUrl[] = await Promise.all(
        files.map(async (file) => {
          const { data, error } = await supabase.storage
            .from('avatars')
            .createSignedUrl(file.path_in_storage, 60); // 60초 동안 유효

          return {
            id: file.id,
            original_filename: file.original_filename,
            signedUrl: error ? '' : data.signedUrl,
          };
        })
      );

      setFilesWithSignedUrls(filesWithSignedUrls);
      setLoading(false);
    }

    loadUserAndFiles();
  }, [supabase]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setLoading(true);
    setError(null);

    // 1. 서명된 업로드 URL 생성
    const fileInfo = {
      filename: selectedFile.name,
      contentType: selectedFile.type,
    };
    const uploadUrlResponse: UploadUrlResponse = await createSignedUploadUrl(fileInfo);

    if ('failure' in uploadUrlResponse) {
      setError(uploadUrlResponse.failure.error);
      setLoading(false);
      return;
    }

    const { url: signedUrl, path: pathInStorage } = uploadUrlResponse.success;

    // 2. 서명된 URL을 사용하여 파일 업로드 (PUT 요청)
    try {
      const response = await fetch(signedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': selectedFile.type,
          'x-upsert': 'true', // 필요 시 (Supabase 문서 참조)
        },
        body: selectedFile,
      });

      if (!response.ok) {
        throw new Error('파일 업로드 실패');
      }

      // 3. 메타데이터 저장
      const metadata = {
        pathInStorage,
        originalFilename: selectedFile.name,
        mimeType: selectedFile.type,
        size: selectedFile.size,
        description: '', // 선택적
      };
      const saveResponse: SaveMetadataResponse = await saveFileMetadata(metadata);

      if ('failure' in saveResponse) {
        setError(saveResponse.failure.error);
        setLoading(false);
        return;
      }

      // 업로드 성공 후 파일 목록 새로고침
      window.location.reload(); // 또는 상태 업데이트 로직으로 대체
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
      setSelectedFile(null);
    }
  };

  if (loading) return <p>로딩 중...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>내 파일 목록</h1>
      {filesWithSignedUrls.map((file) => (
        file.signedUrl && (
          <div key={file.id}>
            <p>{file.original_filename}</p>
            {/* 3. 서명된 URL을 사용하여 이미지 표시 */}
            <Image src={file.signedUrl} alt={file.original_filename || 'Uploaded file'} width={200} height={200} />
          </div>
        )
      ))}

      <h2>파일 업로드</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!selectedFile || loading}>
        {loading ? '업로드 중...' : '업로드'}
      </button>
    </div>
  );
}