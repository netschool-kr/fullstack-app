// app/interactive-test/components/theme-toggle.tsx
'use client';

import { useRecoilState } from 'recoil';
import { themeState } from '@/store/theme';
import { useEffect } from 'react';

export default function ThemeToggle() {
  const  [theme, setTheme] = useRecoilState(themeState);

  const toggleTheme = () => {
    // 현재 테마를 기반으로 다음 테마 상태를 결정하여 업데이트
    setTheme((prevTheme) => (prevTheme === 'light'? 'dark' : 'light'));
  };

  // theme 상태가 변경될 때마다 부수 효과(side effect)를 실행
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <button
      onClick={toggleTheme}
      className="px-4 py-2 text-sm font-medium rounded-md border"
    >
      {theme === 'light'? '🌙 Dark Mode' : '☀️ Light Mode'}
    </button>
  );
}
