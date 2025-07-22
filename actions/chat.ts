// actions/chat.ts
'use server'
import { createClient } from '@/utils/supabase/server';

async function getMessagesWithProfiles(roomId: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
   .from('messages')
   .select(`
      id,
      content,
      created_at,
      user_id,
      profiles (
        username,
        avatar_url
      )
    `)
   .eq('room_id', roomId)
   .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return;
  }

  return data;
}
