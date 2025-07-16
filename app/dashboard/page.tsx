// app/dashboard/page.tsx

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { signOut } from '@/app/auth/actions';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/login');
  }

  return (
    <div>
      <h1>Welcome to your Dashboard</h1>
      <p>Hello, {user.email}</p>

      <form action={signOut}>
        <button type="submit">Sign Out</button>
      </form>
    </div>
  );
}