import { useCallback, useEffect, useState } from "react";
import { FREE_INDEX } from "@/lib/bingo";

type Marks = Record<string, boolean[]>;

function emptyMarks(): boolean[] {
  const arr = new Array<boolean>(25).fill(false);
  arr[FREE_INDEX] = true;
  return arr;
}

/** Marcado manual por cartón, persistido localmente para sobrevivir recargas. */
export function useMarks(gameId: string | null) {
  const storageKey = gameId ? `bingo75:marks:${gameId}` : null;
  const [marks, setMarks] = useState<Marks>({});

  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      setMarks(raw ? (JSON.parse(raw) as Marks) : {});
    } catch {
      setMarks({});
    }
  }, [storageKey]);

  const persist = useCallback(
    (next: Marks) => {
      setMarks(next);
      if (storageKey) window.localStorage.setItem(storageKey, JSON.stringify(next));
    },
    [storageKey],
  );

  const getMarks = useCallback(
    (cardId: string) => marks[cardId] ?? emptyMarks(),
    [marks],
  );

  const toggle = useCallback(
    (cardId: string, index: number) => {
      if (index === FREE_INDEX) return;
      const current = marks[cardId] ?? emptyMarks();
      const next = [...current];
      next[index] = !next[index];
      persist({ ...marks, [cardId]: next });
    },
    [marks, persist],
  );

  const reset = useCallback(() => persist({}), [persist]);

  return { getMarks, toggle, reset };
}
