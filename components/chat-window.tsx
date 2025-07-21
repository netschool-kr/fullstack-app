// components/chat-window.tsx (클라이언트 컴포넌트 내)
'use client';
// 💡 'use client' 지시어는 이 컴포넌트가 클라이언트 측에서 렌더링되고 실행되어야 함을 Next.js에 알립니다.
// React 훅(useState, useEffect)을 사용하기 때문에 필수입니다.
'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';

// 1️⃣ 타입 정의 (TypeScript)
// 데이터의 구조를 명확히 하고, 코드 자동 완성과 타입 체크의 이점을 얻습니다.

/** 사용자 프로필 데이터 구조 */
interface Profile {
  username: string;
  avatar_url: string | null;
}

/** 메시지 데이터 구조 (프로필 정보 포함) */
export interface Message {
  id: number;
  content: string;
  created_at: string;
  user_id: string;
  profiles: Profile | null; // profiles 테이블과 JOIN된 결과
}

/** ChatWindow 컴포넌트가 받을 props 타입 */
interface ChatWindowProps {
  roomId: number;
  initialMessages: Message[];
}

// 2️⃣ 컴포넌트 본문
export default function ChatWindow({ roomId, initialMessages }: ChatWindowProps) {
  const [messages, setMessages] = useState(initialMessages);
  const supabase = createClient();
  
  // 메시지 목록의 가장 아래로 스크롤하기 위한 ref
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 새 메시지가 추가될 때마다 스크롤을 맨 아래로 이동시키는 함수
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 메시지 목록이 변경될 때마다 자동 스크롤 실행
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Supabase 실시간 구독 로직
  useEffect(() => {
    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          // 중요: 실시간으로 받은 payload에는 profiles 정보가 없습니다.
          // 따라서 user_id를 이용해 프로필 정보를 별도로 조회해야 합니다.
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', payload.new.user_id)
            .single();

          if (error) {
            console.error('Error fetching profile for new message:', error);
            return;
          }
          
          // 새로 받은 메시지와 방금 조회한 프로필 정보를 합쳐줍니다.
          const newMessageWithProfile: Message = {
            ...payload.new,
            profiles: profile,
          };

          setMessages((currentMessages) => [...currentMessages, newMessageWithProfile]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, roomId]);

  // 3️⃣ UI 렌더링 로직 (JSX)
  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      <div className="flex-1 overflow-y-auto pr-4">
        <ul className="space-y-4">
          {messages.map((msg) => (
            <li key={msg.id} className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Image
                  src={msg.profiles?.avatar_url ?? '/default-avatar.png'} // 아바타가 없으면 기본 이미지
                  alt={msg.profiles?.username ?? 'user'}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-bold">
                    {msg.profiles?.username ?? '익명'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-gray-800 break-words">{msg.content}</p>
              </div>
            </li>
          ))}
        </ul>
        {/* 새 메시지가 추가될 때 이 div로 스크롤됩니다. */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}