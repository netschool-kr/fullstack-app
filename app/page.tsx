// app/page.tsx

import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton"; // 방금 만든 컴포넌트 임포트

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div>
      <header>
        <nav>
          {user ? (
            <div>
              <span>Hello, {user.email}</span>
              <LogoutButton />
            </div>
          ) : (
            <Link href="/login">
              Login
            </Link>
          )}
        </nav>
      </header>
      <main>
        <h1>Welcome to the Main Page</h1>
        {/* ... 페이지 본문 내용 ... */}
      </main>
    </div>
  );
}