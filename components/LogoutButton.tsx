// app/components/LogoutButton.tsx
import { signOut } from '@/app/auth/actions';

export function LogoutButton() {
  return (
    <form action={signOut}>
      <button type="submit">로그아웃</button>
    </form>
  );
}
