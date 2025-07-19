// components/theme-controller.tsx
'use client';

import { useAtom } from 'jotai';
import { themeAtom, Theme } from '@/store/theme'; // Theme 타입 import 추가
import { useEffect } from 'react';

export default function ThemeController() {
  const [theme, setTheme] = useAtom(themeAtom);

  useEffect(() => {
    // 초기 로드: localStorage 또는 시스템 prefers로 동기화
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []); // 빈 배열: 한 번만 실행

  useEffect(() => {
    // theme 변경 시 클래스 업데이트 및 localStorage 저장
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <button onClick={toggleTheme}>
      {theme === 'light' ? ' 🌙 ' : ' ☀️ '}
    </button>
  );
}