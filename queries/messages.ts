// queries/messages.ts (기존 getChatRooms에 추가)
'use server'

import { createClient } from '@/utils/supabase/server';  // 서버 클라이언트

export async function getMessages(roomId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}