import { createBrowserClient } from '@supabase/ssr';

/**
 * 클라이언트 컴포넌트에서 사용하기 위한 Supabase 클라이언트를 생성합니다.
 * 이 클라이언트는 브라우저 환경에서 실행되며, 공개(anon) 키를 사용합니다.
 * 내부적으로 브라우저의 쿠키를 사용하여 사용자 세션을 관리합니다.
 *
 * @returns {SupabaseClient} Supabase 클라이언트 인스턴스
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
