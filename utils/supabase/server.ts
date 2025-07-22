// utils/supabase/server.ts
'use server'

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * 서버 컴포넌트, 서버 액션, 라우트 핸들러에서 사용하기 위한 Supabase 클라이언트를 생성합니다.
 * 이 클라이언트는 서버 환경에서 실행되며, 'next/headers'의 cookies() 함수를 통해
 * 들어오는 요청의 쿠키를 읽고, 응답에 쿠키를 설정할 수 있습니다.
 *
 * @returns {Promise<SupabaseClient>} Supabase 클라이언트 인스턴스
 */
export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // `setAll` 메소드는 서버 컴포넌트에서 호출될 때 에러를 발생시킬 수 있습니다.
            // 이는 서버 컴포넌트가 렌더링된 후에는 쿠키를 설정할 수 없기 때문입니다.
            // 미들웨어가 세션을 갱신하고 있으므로, 이 에러는 무시해도 안전합니다.
          }
        },
      },
    }
  );
};