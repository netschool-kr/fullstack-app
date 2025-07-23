// components/ChatRoom.tsx
'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sendMessage } from '@/actions/chat-actions';
import { getMessages } from '@/queries/messages';
import { createClient } from '@/utils/supabase/client';

interface Message {
  id: number;
  content: string;
  created_at: string;
  user_id: string;
}

export default function ChatRoom({ roomId, initialMessages }: { roomId: string; initialMessages: Message[] }) {
  const supabase = createClient();
  const [newMessage, setNewMessage] = useState('');
  const queryClient = useQueryClient();  // import 필요

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ['messages', roomId],
    queryFn: () => getMessages(roomId),
    initialData: initialMessages,
  });

  // Realtime 구독
  useEffect(() => {
    const channel = supabase
      .channel(`messages_${roomId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` }, (payload) => {
        queryClient.setQueryData(['messages', roomId], (old: Message[] | undefined) => [...(old || []), payload.new as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase, queryClient, roomId]);

  const mutation = useMutation({
    mutationFn: (content: string) => {
      const formData = new FormData();
      formData.append('content', content);
      formData.append('roomId', roomId);
      return sendMessage(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', roomId] });
    },
  });

  const handleSend = () => {
    if (newMessage) {
      mutation.mutate(newMessage);
      setNewMessage('');
    }
  };

  return (
    <div>
      <ul>
        {messages.map((msg) => (
          <li key={msg.id}>{msg.content} ({new Date(msg.created_at).toLocaleString()})</li>
        ))}
      </ul>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="메시지 입력"
      />
      <button onClick={handleSend}>보내기</button>
    </div>
  );
}