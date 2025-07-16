// app/login/page.tsx

import { signIn } from '@/app/auth/actions';

export default function LoginPage() {
  return (
    <div>
      <form action={signIn}>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required />
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required />
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
}