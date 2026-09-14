import { useState } from "react";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";

import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import MyShowsPanel from "./MyShowsPanel";

import type { Dia, Show } from "../types/show";

import styles from "./ShowEditor.module.css";

type ShowEditorProps = {
  show: Show;
  savedShows: Show[];
  onBack: () => void;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  onEditShow: (show: Show) => void;
  onDeleteShow: (show: Show) => void;
  onReorderDias: (activeDiaId: string, overDiaId: string) => void;
};

type SortableDiaProps = {
  dia: Dia;
  index: number;
};

function SortableDia({ dia, index }: SortableDiaProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: dia.id,
  });

  const image = dia.node.imageSmall ?? dia.node.image;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`${styles.dia} ${isDragging ? styles.dragging : ""}`}
    >
      <div className={styles.diaNumber}>
        {String(index + 1).padStart(2, "0")}
      </div>

      <div
        className={styles.media}
        {...attributes}
        {...listeners}
        title="Drag to reorder"
      >
        {image ? (
          <img src={image} alt="" className={styles.image} draggable={false} />
        ) : (
          <div className={styles.placeholder}>
            <span>{dia.node.kind}</span>
          </div>
        )}
      </div>

      <div className={styles.info}>
        <p className={styles.kind}>{dia.node.kind}</p>

        <h2 className={styles.diaTitle}>{dia.node.label}</h2>

        {dia.node.artist && <p className={styles.meta}>{dia.node.artist}</p>}

        {dia.node.date && <p className={styles.meta}>{dia.node.date}</p>}
      </div>
    </article>
  );
}

function ShowEditor({
  show,
  savedShows,
  onBack,
  onTitleChange,
  onSave,
  onEditShow,
  onDeleteShow,
  onReorderDias,
}: ShowEditorProps) {
  const [isShowsOpen, setIsShowsOpen] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    onReorderDias(String(active.id), String(over.id));
  };

  return (
    <div className={styles.workspace}>
      <main className={styles.editor}>
        <header className={styles.header}>
          <button type="button" className={styles.backButton} onClick={onBack}>
            ← Explore
          </button>

          <div>
            <p className={styles.eyebrow}>Show Editor</p>

            <input
              className={styles.titleInput}
              value={show.title}
              placeholder="Untitled Show"
              onChange={(event) => {
                onTitleChange(event.target.value);
              }}
              aria-label="Show title"
            />
          </div>

          <div className={styles.headerActions}>
            <p className={styles.count}>
              {show.dias.length} {show.dias.length === 1 ? "dia" : "dias"}
            </p>

            <button
              type="button"
              className={styles.saveButton}
              onClick={onSave}
            >
              Save Show
            </button>
          </div>
        </header>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={show.dias.map((dia) => dia.id)}
            strategy={verticalListSortingStrategy}
          >
            <section className={styles.diaList}>
              {show.dias.map((dia, index) => (
                <SortableDia key={dia.id} dia={dia} index={index} />
              ))}
            </section>
          </SortableContext>
        </DndContext>
      </main>

      <aside
        className={`${styles.showsRail} ${
          !isShowsOpen ? styles.showsRailCollapsed : ""
        }`}
      >
        <button
          type="button"
          className={styles.showsToggle}
          onClick={() => setIsShowsOpen((current) => !current)}
          aria-label={isShowsOpen ? "Close My Shows" : "Open My Shows"}
          aria-expanded={isShowsOpen}
        >
          {isShowsOpen ? "›" : "‹"}
        </button>

        <div
          className={`${styles.showsContent} ${
            !isShowsOpen ? styles.showsContentHidden : ""
          }`}
        >
          <MyShowsPanel
            shows={savedShows}
            activeShowId={show.id}
            onEdit={onEditShow}
            onDelete={onDeleteShow}
          />
        </div>
      </aside>
    </div>
  );
}

export default ShowEditor;
