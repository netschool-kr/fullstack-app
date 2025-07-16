// components/Header.tsx
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import { signOut } from '@/app/auth/actions';

export default async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header>
      <nav>
        <Link href="/">홈</Link>
        <div>
          {user? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span>{user.email}</span>
              <form action={signOut}>
                <button type="submit">로그아웃</button>
              </form>
            </div>
          ) : (
            <Link href="/login">
              <button>로그인</button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
