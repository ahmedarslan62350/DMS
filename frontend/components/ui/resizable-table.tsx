"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ResizableColumnDef {
  id: string;
  width: number;
  minWidth?: number;
  maxWidth?: number;
}

const DEFAULT_MIN = 72;
const DEFAULT_MAX = 640;
const KEYBOARD_STEP = 16;

/**
 * Manages per-column pixel widths for a table, driven by pointer-drag
 * resize handles. Widths live in component state only (not persisted),
 * so a page refresh restores the defaults defined in `columns`.
 */
export function useResizableColumns(columns: ResizableColumnDef[]) {
  const [widths, setWidths] = React.useState<Record<string, number>>(() =>
    Object.fromEntries(columns.map((c) => [c.id, c.width])),
  );

  const boundsRef = React.useRef<Record<string, { min: number; max: number; initial: number }>>(
    Object.fromEntries(
      columns.map((c) => [
        c.id,
        {
          min: c.minWidth ?? DEFAULT_MIN,
          max: c.maxWidth ?? DEFAULT_MAX,
          initial: c.width,
        },
      ]),
    ),
  );

  const dragState = React.useRef<{
    id: string;
    startX: number;
    startWidth: number;
  } | null>(null);

  const clamp = React.useCallback((id: string, value: number) => {
    const bounds = boundsRef.current[id] ?? { min: DEFAULT_MIN, max: DEFAULT_MAX };
    return Math.min(bounds.max, Math.max(bounds.min, value));
  }, []);

  const onPointerMove = React.useCallback(
    (e: PointerEvent) => {
      const drag = dragState.current;
      if (!drag) return;
      const delta = e.clientX - drag.startX;
      setWidths((prev) => ({
        ...prev,
        [drag.id]: clamp(drag.id, drag.startWidth + delta),
      }));
    },
    [clamp],
  );

  const stopResize = React.useCallback(() => {
    dragState.current = null;
    document.body.style.removeProperty("cursor");
    document.body.style.removeProperty("user-select");
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", stopResize);
  }, [onPointerMove]);

  const startResize = React.useCallback(
    (id: string) => (e: React.PointerEvent) => {
      e.preventDefault();
      dragState.current = {
        id,
        startX: e.clientX,
        startWidth: widths[id] ?? boundsRef.current[id]?.initial ?? 150,
      };
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", stopResize);
    },
    [widths, onPointerMove, stopResize],
  );

  const nudgeColumn = React.useCallback(
    (id: string, direction: 1 | -1) => {
      setWidths((prev) => ({
        ...prev,
        [id]: clamp(id, (prev[id] ?? boundsRef.current[id]?.initial ?? 150) + direction * KEYBOARD_STEP),
      }));
    },
    [clamp],
  );

  const resetColumn = React.useCallback((id: string) => {
    setWidths((prev) => ({
      ...prev,
      [id]: boundsRef.current[id]?.initial ?? prev[id],
    }));
  }, []);

  const resetAll = React.useCallback(() => {
    setWidths(
      Object.fromEntries(
        Object.entries(boundsRef.current).map(([id, b]) => [id, b.initial]),
      ),
    );
  }, []);

  React.useEffect(() => {
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", stopResize);
    };
  }, [onPointerMove, stopResize]);

  return { widths, startResize, nudgeColumn, resetColumn, resetAll };
}

interface ColumnResizeHandleProps {
  columnLabel: string;
  width: number;
  minWidth?: number;
  maxWidth?: number;
  onPointerDown: (e: React.PointerEvent) => void;
  onNudge: (direction: 1 | -1) => void;
  onReset: () => void;
  className?: string;
}

export function ColumnResizeHandle({
  columnLabel,
  width,
  minWidth = DEFAULT_MIN,
  maxWidth = DEFAULT_MAX,
  onPointerDown,
  onNudge,
  onReset,
  className,
}: Readonly<ColumnResizeHandleProps>) {
  return (
    <span
      role="separator"
      aria-orientation="vertical"
      aria-label={`Resize ${columnLabel} column`}
      aria-valuenow={Math.round(width)}
      aria-valuemin={minWidth}
      aria-valuemax={maxWidth}
      tabIndex={0}
      onPointerDown={onPointerDown}
      onDoubleClick={onReset}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          onNudge(-1);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          onNudge(1);
        } else if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onReset();
        }
      }}
      className={cn(
        "group/handle absolute top-0 right-0 z-10 h-full w-2.5 -mr-1.5 cursor-col-resize touch-none rounded-sm outline-none select-none",
        "focus-visible:ring-2 focus-visible:ring-ring/60",
        className,
      )}
    >
      <span className="absolute top-1/2 right-1/2 h-full w-px -translate-y-1/2 translate-x-1/2 bg-border transition-colors group-hover/handle:bg-primary/60 group-focus-visible/handle:bg-primary" />
    </span>
  );
}
