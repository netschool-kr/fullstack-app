// middleware.ts
import { type NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  // 모든 요청에 대해 세션 갱신 로직을 실행합니다.
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * 다음으로 시작하는 경로를 제외한 모든 요청 경로와 일치시킵니다:
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화 파일)
     * - favicon.ico (파비콘 파일)
     *
     * 이 경로는 세션 정보가 필요 없으므로 미들웨어 실행에서 제외하여
     * 불필요한 실행을 방지하고 성능을 최적화합니다.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
