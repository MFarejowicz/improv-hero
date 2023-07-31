import { useMemo, useRef } from "react";

import { TEMPO, ONE_BEAT } from '../constants';

export function useColumns() {
  const sRef = useRef<HTMLDivElement | null>(null);
  const dRef = useRef<HTMLDivElement | null>(null);
  const fRef = useRef<HTMLDivElement | null>(null);
  const gRef = useRef<HTMLDivElement | null>(null);
  const hRef = useRef<HTMLDivElement | null>(null);
  const jRef = useRef<HTMLDivElement | null>(null);

  const columnRefs = useMemo(() => [sRef, dRef, fRef, gRef, hRef, jRef], []);

  /**
   * Create a note that slides from bottom to top. Used when actively improving.
   */
  const slideOutAtColumn = (index: number) => {
    const column = columnRefs[index];
    if (column.current != null) {
      const noteDiv = document.createElement("div");
      noteDiv.classList.add("note", "slide-up");
      column.current.appendChild(noteDiv);
      setTimeout(() => noteDiv.remove(), ONE_BEAT * 4);
    }
  }

  /**
   * Create a note that slides from top to bottom. Used when replaying an improv.
   * Note that this function must be called in advance so that the replay player
   * can see the note sufficiently ahead of time.
   */
  const slideInAtColumn = (index: number) => {
    const column = columnRefs[index];
    if (column.current != null) {
      const noteDiv = document.createElement("div");
      noteDiv.classList.add("note", "slide-down");
      column.current.appendChild(noteDiv);
      setTimeout(() => noteDiv.remove(), ONE_BEAT * 4);
    }
  }

  return {
    columnRefs: [sRef, dRef, fRef, gRef, hRef, jRef],
    slideOutAtColumn,
    slideInAtColumn
  }
}
