// components/chat-window.tsx (클라이언트 컴포넌트 내)
// 💡 'use client' 지시어는 이 컴포넌트가 클라이언트 측에서 렌더링되고 실행되어야 함을 Next.js에 알립니다.
// React 훅(useState, useEffect)을 사용하기 때문에 필수입니다.
'use client';

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';
import { RealtimePostgresInsertPayload } from '@supabase/supabase-js';  // ⭐ 추가: Supabase 타입 import

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

/** 온라인 사용자 데이터 구조 */
interface OnlineUser {
  user_id: string;
  username: string;
  online_at: string;
  presence_ref: string; // Supabase Presence에서 자동으로 추가되는 필드
}

/** ChatWindow 컴포넌트가 받을 props 타입 */
interface ChatWindowProps {
  roomId: number;
  initialMessages: Message[];
}

// 2️⃣ 컴포넌트 본문
export default function ChatWindow({ roomId, initialMessages }: ChatWindowProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [user, setUser] = useState<any>(null); // 현재 사용자 정보
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
  
  // 현재 사용자 정보 로드
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, [supabase]);
  
  // Supabase 실시간 구독 로직 (메시지 및 Presence)
  useEffect(() => {
    if (!user) return; // 사용자 정보가 로드될 때까지 대기

    const channel = supabase
      .channel(`room:${roomId}`, {
        config: {
          presence: {
            key: user.id, // 각 클라이언트를 고유하게 식별할 키
          },
        },
      })
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload: RealtimePostgresInsertPayload<Message>) => {  // ⭐ 수정: payload 타입 지정 (Message 기반)
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
            ...payload.new,  // 이제 타입이 지정되어 id, content 등 제대로 인식됨
            profiles: profile as Profile | null,  // ⭐ 수정: profile 타입 캐스팅 (any 피하기)
          };

          // 상태를 업데이트하기 전에, 새로운 메시지가 이미 목록에 있는지 확인
          setMessages((currentMessages) => {
            if (currentMessages.find(msg => msg.id === newMessageWithProfile.id)) {
              // 이미 존재하면 상태를 변경하지 않음
              return currentMessages;
            }
            // 존재하지 않는 새로운 메시지만 추가
            return [...currentMessages, newMessageWithProfile];
          });
        }
      )
      .on('presence', { event: 'sync' }, () => {
        console.log('Online users synced');
        const presenceState = channel.presenceState();
        const users: OnlineUser[] = Object.keys(presenceState)
          .map((presenceId) => {
            const presences = presenceState[presenceId] as OnlineUser[];
            return presences[0]; // 각 사용자의 첫 번째 상태 정보만 사용 (멀티 세션 고려)
          });
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences);
        setOnlineUsers(currentUsers => [...currentUsers, ...newPresences as OnlineUser[]]);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences);
        const leftUserIds = leftPresences.map(p => p.user_id);
        setOnlineUsers(currentUsers => currentUsers.filter(u => !leftUserIds.includes(u.user_id)));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ 
            user_id: user.id,
            username: user.user_metadata.username, // 프로필에서 가져온 사용자명
            online_at: new Date().toISOString() 
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, roomId, user]);

  // 3️⃣ UI 렌더링 로직 (JSX)
  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      <div className="online-users mb-4">
        <h3 className="font-bold text-lg">Online Users ({onlineUsers.length})</h3>
        <ul className="list-disc pl-5">
          {onlineUsers.map((u) => (
            <li key={u.user_id} className="text-sm text-gray-600">
              {u.username} (online since {new Date(u.online_at).toLocaleTimeString()})
            </li>
          ))}
        </ul>
      </div>
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