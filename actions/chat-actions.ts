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
  const { data: newRoomId, error } = await supabase.rpc('create_new_chat_room', { room_name: roomName});

  if (error) {
    console.error('Error creating chat room:', error);
    if (error.code === '23503') {
      throw new Error('프로필이 존재하지 않습니다. 프로필을 먼저 생성하세요.');
    }
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

  
  // 세션 명시적으로 로드 및 설정
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('세션이 없습니다. 로그인하세요.');
  }
  supabase.auth.setSession(session);  // 토큰 설정

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('인증되지 않은 사용자입니다.');
  }

  // const { data: uidTest, error: uidError } = await supabase.rpc('test_auth_uid');
  // console.log('Auth UID test:', uidTest, 'Error:', uidError);

  const { error } = await supabase.from('messages').insert({
    content: content,
    room_id: parseInt(roomId, 10),
    user_id: user.id,
  });

  if (error) {
    console.error('Error sending message:', error, ":", { userId: user.id }, ":", {roomId}, ":", {content});
    throw new Error('메시지 전송에 실패했습니다.');
  }

  revalidatePath(`/chat/${roomId}`);
}