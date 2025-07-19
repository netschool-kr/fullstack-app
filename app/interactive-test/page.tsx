// app/interactive-test/page.tsx
import ThemeToggle from './components/theme-toggle';

export default function InteractiveTestPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">상태 관리 실습 페이지</h1>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">클라이언트 상태 (Recoil)</h2>
        <ThemeToggle />
      </div>
      {/* 서버 상태 컴포넌트는 나중에 여기에 추가됩니다. */}
    </div>
  );
}
