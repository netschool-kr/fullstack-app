// actions/chat-actions.ts
'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createChatRoom(formData: FormData): Promise<void> {
  const roomName = formData.get('roomName') as string;

  if (!roomName) {
    throw new Error('채팅방 이름이 필요합니다.');
  }

  const supabase = await createClient();

  // 데이터베이스 함수(RPC)를 호출하여 트랜잭션을 처리
  const { data: newRoomId, error } = await supabase.rpc('create_new_chat_room', {
    room_name: roomName,
  });

  if (error) {
    console.error('Error creating chat room:', error);
    throw new Error('채팅방 생성에 실패했습니다.');
  }

  // 성공 시 캐시를 무효화하고 새로운 채팅방으로 리디렉션
  revalidatePath('/chat');
  redirect(`/chat/${newRoomId}`);
}

export async function sendMessage(formData: FormData): Promise<void> {
  const content = formData.get('content') as string;
  const roomId = formData.get('roomId') as string;

  if (!content || !roomId) {
    throw new Error('메시지 내용과 채팅방 ID가 필요합니다.');
  }

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('인증되지 않은 사용자입니다.');
  }

  const { error } = await supabase.from('messages').insert({
    content: content,
    room_id: parseInt(roomId, 10),
    user_id: user.id,
  });

  if (error) {
    console.error('Error sending message:', error);
    throw new Error('메시지 전송에 실패했습니다.');
  }

  revalidatePath(`/chat/${roomId}`);
}