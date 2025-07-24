// components/SortableList.tsx
'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// 개별 아이템 컴포넌트
function SortableItem({ id, children }: { id: string | number; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners} className="p-4 bg-white border rounded-lg shadow-sm mb-2 touch-none">
      {children}
    </li>
  );
}

// 메인 리스트 컴포넌트
export function SortableList({ initialItems }: { initialItems: { id: number; title: string; order: number } }) {
  const [items, setItems] = useState(initialItems.sort((a, b) => a.order - b.order));
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id!== over.id) {
      setItems((currentItems) => {
        const oldIndex = currentItems.findIndex((item) => item.id === active.id);
        const newIndex = currentItems.findIndex((item) => item.id === over.id);
        const reorderedItems = arrayMove(currentItems, oldIndex, newIndex);
        
        // TODO: 서버 액션을 호출하여 변경된 순서를 저장
        
        return reorderedItems;
      });
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
        <ul>
          {items.map((item) => (
            <SortableItem key={item.id} id={item.id}>
              {item.title}
            </SortableItem>
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
