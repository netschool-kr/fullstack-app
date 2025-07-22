// queries/chat-rooms.ts
'use server'
import { createClient } from '@/utils/supabase/server';

interface ChatRoom {
  id: string;
  name: string;
  created_at: string;
}

export async function getChatRooms(): Promise<ChatRoom[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('chat_rooms')
    .select('id, name, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching chat rooms:', error);
    throw new Error('Failed to fetch chat rooms');
  }

  return data || [];
}