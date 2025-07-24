// components/SortableAttachmentList.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { updateAttachmentOrderAction } from '@/actions/attachment-actions';
import UploadButton from '@/components/UploadButton'; // UploadButton 임포트 (이전 버전 가정)

// Attachment 타입 정의
type Attachment = {
  id: number;
  file_path: string;
  order: number;
};

// 개별 아이템 컴포넌트
function SortableItem({ attachment }: { attachment: Attachment }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: attachment.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners} className="p-2 bg-white border rounded-lg shadow-sm touch-none">
      <Image src={attachment.file_path} alt={`Attachment ${attachment.id}`} width={150} height={150} className="object-cover rounded-md" />
    </li>
  );
}

// 메인 리스트 컴포넌트
export function SortableAttachmentList({ initialItems, postId }: { initialItems: Attachment[], postId: number }) {
  const [items, setItems] = useState(initialItems.sort((a, b) => a.order - b.order));
  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      // 현재 상태(items)를 사용해 새로운 배열 미리 계산 (arrayMove는 순수 함수이므로 안전)
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      const reorderedItems = arrayMove(items, oldIndex, newIndex);

      // 페이로드 생성
      const updatePayload = reorderedItems.map((item, index) => ({
        id: item.id,
        new_order: index,
      }));

      // 상태 업데이트 (콜백 없이 직접 설정)
      setItems(reorderedItems);

      // 서버 액션 호출을 밖으로 이동
      updateAttachmentOrderAction(updatePayload, postId).catch(console.error);
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-lg font-semibold mb-4">첨부 파일이 없습니다.</p>
            <UploadButton postId={postId} onUploadSuccess={(newAttachment) => {
              // 업로드 성공 시 items 상태 업데이트 (낙관적 추가)
              setItems((prev) => [...prev, { ...newAttachment, order: prev.length }]);
            }} />
            <p className="text-sm text-gray-500 mt-2">파일을 업로드하여 시작하세요. 업로드 후 드래그로 순서를 조정할 수 있습니다.</p>
          </div>
        ) : (
          <>
            <ul className="grid grid-cols-3 gap-4">
              {items.map((item) => (
                <SortableItem key={item.id} attachment={item} />
              ))}
            </ul>
            {/* 리스트가 있을 때도 업로드 버튼을 아래에 추가 */}
            <div className="mt-6 flex justify-center">
              <UploadButton postId={postId} onUploadSuccess={(newAttachment) => {
                // 업로드 성공 시 items 상태 업데이트
                setItems((prev) => [...prev, { ...newAttachment, order: prev.length }]);
              }} />
              <p className="text-sm text-gray-500 mt-2 ml-4">추가 파일을 업로드하세요.</p>
            </div>
          </>
        )}
      </SortableContext>
    </DndContext>
  );
}