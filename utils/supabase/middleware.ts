// utils/supabase/middleware.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // [변경 후] 'get' 대신 'getAll'을 사용합니다.
        // 모든 쿠키를 한 번에 배열로 가져옵니다.
        getAll() {
          return request.cookies.getAll();
        },
        // [변경 후] 'set'과 'remove' 대신 'setAll'을 사용합니다.
        // 여러 쿠키를 한 번에 설정합니다.
        setAll(cookiesToSet) {
          // forEach를 사용해 전달받은 모든 쿠키를 처리합니다.
          cookiesToSet.forEach(({ name, value, options }) => {
            // 먼저 요청 객체의 쿠키를 업데이트합니다.
            request.cookies.set({ name, value, ...options });
            // 그 다음, 응답 객체의 쿠키를 설정합니다.
            // (주의: response 객체는 반복문 안에서 갱신할 필요가 없습니다.)
            response.cookies.set({ name, value, ...options });
          });
        },
      },
    }
  );

  // 세션 갱신을 위해 getUser() 호출 (이 부분은 변경 없음)
  await supabase.auth.getUser();

  return response;
}