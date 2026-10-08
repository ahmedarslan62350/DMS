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

interface DragState {
  id: string;
  startX: number;
  startWidth: number;
}

/**
 * Manages per-column pixel widths for a table, driven by pointer-drag resize
 * handles. Widths live in component state only (not persisted), so a page
 * refresh restores the defaults defined in `columns`.
 *
 * The drag is modelled as state plus one effect that owns the window
 * listeners, so the listeners are always torn down by React itself. The
 * previous version registered handlers imperatively and declared its cleanup
 * in terms of itself, which could strand a `pointermove` listener and left the
 * document cursor stuck on `col-resize`.
 */
export function useResizableColumns(columns: ResizableColumnDef[]) {
  const [widths, setWidths] = React.useState<Record<string, number>>(() =>
    Object.fromEntries(columns.map((c) => [c.id, c.width])),
  );
  const [drag, setDrag] = React.useState<DragState | null>(null);

  const bounds = React.useMemo(
    () =>
      Object.fromEntries(
        columns.map((c) => [
          c.id,
          {
            min: c.minWidth ?? DEFAULT_MIN,
            max: c.maxWidth ?? DEFAULT_MAX,
            initial: c.width,
          },
        ]),
      ) as Record<string, { min: number; max: number; initial: number }>,
    [columns],
  );

  const clamp = React.useCallback(
    (id: string, value: number) => {
      const limit = bounds[id] ?? { min: DEFAULT_MIN, max: DEFAULT_MAX };
      return Math.min(limit.max, Math.max(limit.min, value));
    },
    [bounds],
  );

  /* ---- The single owner of the drag listeners ---- */
  React.useEffect(() => {
    if (!drag) return;

    const onPointerMove = (event: PointerEvent) => {
      const delta = event.clientX - drag.startX;
      setWidths((prev) => ({
        ...prev,
        [drag.id]: clamp(drag.id, drag.startWidth + delta),
      }));
    };

    const endDrag = () => setDrag(null);

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", endDrag);
    window.addEventListener("pointercancel", endDrag);

    return () => {
      document.body.style.removeProperty("cursor");
      document.body.style.removeProperty("user-select");
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", endDrag);
      window.removeEventListener("pointercancel", endDrag);
    };
  }, [drag, clamp]);

  const startResize = React.useCallback(
    (id: string) => (event: React.PointerEvent) => {
      event.preventDefault();
      setDrag({
        id,
        startX: event.clientX,
        startWidth: widths[id] ?? bounds[id]?.initial ?? 150,
      });
    },
    [widths, bounds],
  );

  const nudgeColumn = React.useCallback(
    (id: string, direction: 1 | -1) => {
      setWidths((prev) => ({
        ...prev,
        [id]: clamp(
          id,
          (prev[id] ?? bounds[id]?.initial ?? 150) + direction * KEYBOARD_STEP,
        ),
      }));
    },
    [clamp, bounds],
  );

  const resetColumn = React.useCallback(
    (id: string) => {
      setWidths((prev) => ({
        ...prev,
        [id]: bounds[id]?.initial ?? prev[id],
      }));
    },
    [bounds],
  );

  const resetAll = React.useCallback(() => {
    setWidths(
      Object.fromEntries(
        Object.entries(bounds).map(([id, limit]) => [id, limit.initial]),
      ),
    );
  }, [bounds]);

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
        "group/handle absolute top-0 right-0 z-10 -mr-1.5 h-full w-2.5 cursor-col-resize touch-none rounded-sm outline-none select-none",
        "focus-visible:ring-2 focus-visible:ring-ring/60",
        className,
      )}
    >
      <span className="absolute top-1/2 right-1/2 h-full w-px -translate-y-1/2 translate-x-1/2 bg-border transition-colors group-hover/handle:bg-primary/60 group-focus-visible/handle:bg-primary" />
    </span>
  );
}
