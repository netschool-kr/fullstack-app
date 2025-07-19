// store/theme.ts
import { atom } from 'jotai';

export type Theme = 'light' | 'dark';

export const themeAtom = atom<Theme>('light'); // 기본값만으로 아톰 생성
