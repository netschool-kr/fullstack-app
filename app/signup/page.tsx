import { signUp } from '@/app/auth/actions';

export default function SignupPage() {
  return (
    <div>
      <h1>회원가입</h1>
      <form>
        <label htmlFor="email">이메일</label>
        <input id="email" name="email" type="email" required />
        <label htmlFor="password">비밀번호</label>
        <input id="password" name="password" type="password" required />
        <button formAction={signUp}>회원가입</button>
      </form>
    </div>
  );
}
