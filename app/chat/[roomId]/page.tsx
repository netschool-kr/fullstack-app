// app/chat/[roomId]/page.tsx
import { getChatRoomById } from '@/queries/chat-rooms';  // 필요 시 방 정보 조회 쿼리 import (새로 정의해야 함)
import { getMessages } from '@/queries/messages';  // 메시지 조회 쿼리 import (필요 시)
import ChatRoom from '@/components/ChatRoom';  // 채팅방 컴포넌트 (새로 만들어야 함)

interface Params {
  params: { roomId: string };
}

export default async function ChatRoomPage({ params }: Params) {
  const awaitedParams = await params;  // params를 await
  const { roomId } = awaitedParams;    // 이제 안전하게 roomId 추출

  // 서버 측에서 방 정보와 메시지 페칭
  const room = await getChatRoomById(roomId);
  if (!room) {
    return <div>채팅방을 찾을 수 없습니다:{roomId}</div>;
  }

  const initialMessages = await getMessages(roomId);

  return (
    <main>
      <h1>{room.name} 채팅방</h1>
      <ChatRoom roomId={roomId} initialMessages={initialMessages} />
    </main>
  );
}