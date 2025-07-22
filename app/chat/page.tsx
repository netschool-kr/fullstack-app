// app/chat/page.tsx
import ChatRoomList from '@/components/ChatRoomList';
import { getChatRooms } from '@/queries/chat-rooms';

export default async function ChatPage() {
  const initialRooms = await getChatRooms();

  return (
    <main>
      <ChatRoomList initialRooms={initialRooms} /> {/* 초기 데이터 prop으로 전달 */}
    </main>
  );
}
