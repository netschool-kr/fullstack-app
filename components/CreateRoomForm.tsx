'use client';

import { useFormStatus } from 'react-dom';
import { createChatRoom } from '@/actions/chat-actions';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending}>
      {pending? '생성 중...' : '채팅방 만들기'}
    </button>
  );
}

export function CreateRoomForm() {
  return (
    <form action={createChatRoom}>
      <label htmlFor="roomName">채팅방 이름:</label>
      <input id="roomName" name="roomName" type="text" required />
      <SubmitButton />
    </form>
  );
}
