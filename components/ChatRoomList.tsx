// components/ChatRoomList.tsx
'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createChatRoom } from '@/actions/chat-actions';
import { getChatRooms } from '@/queries/chat-rooms';
import { createClient } from '@/utils/supabase/client';  // 새 클라이언트 import

interface ChatRoom {
  id: string;
  name: string;
  created_at: string;
}

export default function ChatRoomList({ initialRooms }: { initialRooms: ChatRoom[] }) {
  const supabase = createClient();  // 여기서 생성
  const queryClient = useQueryClient();
  const [newRoomName, setNewRoomName] = useState('');

  // React Query로 채팅방 리스트 페칭 (초기 데이터는 서버에서 제공받음)
  const { data: rooms = [], isLoading } = useQuery<ChatRoom[]>({
    queryKey: ['chat_rooms'],
    queryFn: getChatRooms,
    initialData: initialRooms,
  });

  // Realtime 구독
  useEffect(() => {
    const channel = supabase
      .channel('chat_rooms')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_rooms' }, (payload) => {
        queryClient.setQueryData(['chat_rooms'], (old: ChatRoom[] | undefined) => [...(old || []), payload.new as ChatRoom]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, queryClient]);

  // 서버 액션 호출을 위한 mutation (낙관적 업데이트 적용)
  const mutation = useMutation({
    mutationFn: (name: string) => {
      const formData = new FormData();
      formData.append('roomName', name); // Note: Adjusted to 'roomName' to match the original createChatRoom expectation
      return createChatRoom(formData);
    },
    onMutate: async (name) => {
      // 낙관적 업데이트: UI에 즉시 추가
      await queryClient.cancelQueries({ queryKey: ['chat_rooms'] });
      const previousRooms = queryClient.getQueryData<ChatRoom[]>(['chat_rooms']);
      queryClient.setQueryData(['chat_rooms'], (old: ChatRoom[] | undefined) => [
        ...(old || []),
        { id: 'temp', name, created_at: new Date().toISOString() } as ChatRoom,
      ]);
      return { previousRooms };
    },
    onError: (err, name, context) => {
      // 에러 시 롤백
      queryClient.setQueryData(['chat_rooms'], context?.previousRooms);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['chat_rooms'] });
    },
  });

  const handleCreateRoom = () => {
    if (newRoomName) {
      mutation.mutate(newRoomName);
      setNewRoomName('');
    }
  };

  if (isLoading) return <div>로딩 중...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">대화방 리스트</h1>
      <ul className="space-y-2 mb-4">
        {rooms.map((room) => (
          <li key={room.id} className="border p-2 rounded">
            <a href={`/chat/${room.id}`} className="text-blue-500 hover:underline">
              {room.name} (생성: {new Date(room.created_at).toLocaleString()})
            </a>
          </li>
        ))}
      </ul>
      <div className="flex space-x-2">
        <input
          type="text"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
          placeholder="새 대화방 이름"
          className="border p-2 flex-1"
        />
        <button onClick={handleCreateRoom} className="bg-blue-500 text-white p-2 rounded">
          대화방 생성
        </button>
      </div>
    </div>
  );
}