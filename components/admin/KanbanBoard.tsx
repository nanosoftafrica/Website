"use client";

import type { ReactNode } from "react";
import {
  DndContext,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/* eslint-disable @typescript-eslint/no-explicit-any -- board cards are
   dynamically shaped (Deal vs WorkOrder rows), not a fixed type here */

export interface KanbanStage {
  key: string;
  label: string;
}

interface KanbanBoardProps {
  boardId: string;
  stages: KanbanStage[];
  board: Record<string, any[]>;
  onBoardChange: (board: Record<string, any[]>) => void;
  patchUrl: (id: number) => string;
  cardRender: (item: any) => ReactNode;
  onCardClick?: (item: any) => void;
}

function KanbanCard({ item, children, onClick }: { item: any; children: ReactNode; onClick?: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`adm-kanban-card${isDragging ? " dragging" : ""}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

function KanbanColumn({
  stage,
  items,
  cardRender,
  onCardClick,
}: {
  stage: KanbanStage;
  items: any[];
  cardRender: (item: any) => ReactNode;
  onCardClick?: (item: any) => void;
}) {
  const { setNodeRef } = useDroppable({ id: `col-${stage.key}` });
  return (
    <div className="adm-kanban-col">
      <div className="adm-kanban-col-header">
        <span>{stage.label}</span>
        <span>{items.length}</span>
      </div>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="adm-kanban-col-body" ref={setNodeRef}>
          {items.map((item) => (
            <KanbanCard key={item.id} item={item} onClick={() => onCardClick?.(item)}>
              {cardRender(item)}
            </KanbanCard>
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export default function KanbanBoard({ boardId, stages, board, onBoardChange, patchUrl, cardRender, onCardClick }: KanbanBoardProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function findContainer(id: number | string): string | undefined {
    if (typeof id === "string" && id.startsWith("col-")) return id.slice(4);
    return Object.keys(board).find((key) => board[key].some((it) => it.id === id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id as number;
    const activeContainer = findContainer(activeId);
    const overContainer = findContainer(over.id as string | number);
    if (!activeContainer || !overContainer) return;
    if (activeContainer === overContainer && active.id === over.id) return;

    let persistedOrder = 0;

    const sourceItems = [...board[activeContainer]];
    const activeIndex = sourceItems.findIndex((it) => it.id === activeId);
    if (activeIndex === -1) return;
    const [moved] = sourceItems.splice(activeIndex, 1);

    const destPrev = activeContainer === overContainer ? sourceItems : board[overContainer];
    const overIndex = destPrev.findIndex((it) => it.id === over.id);
    const insertAt = overIndex === -1 ? destPrev.length : overIndex;
    persistedOrder = insertAt;

    const movedUpdated = activeContainer === overContainer ? moved : { ...moved, stage: overContainer };
    const destItems = [...destPrev];
    destItems.splice(insertAt, 0, movedUpdated);

    const nextBoard =
      activeContainer === overContainer
        ? { ...board, [activeContainer]: destItems }
        : { ...board, [activeContainer]: sourceItems, [overContainer]: destItems };
    onBoardChange(nextBoard);

    fetch(patchUrl(activeId), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: overContainer, order: persistedOrder }),
    }).catch(() => {});
  }

  return (
    <DndContext id={boardId} sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="adm-kanban">
        {stages.map((stage) => (
          <KanbanColumn
            key={stage.key}
            stage={stage}
            items={board[stage.key] || []}
            cardRender={cardRender}
            onCardClick={onCardClick}
          />
        ))}
      </div>
    </DndContext>
  );
}

/* eslint-enable @typescript-eslint/no-explicit-any */
