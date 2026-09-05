// Lógica pura del Bingo 75. Se usa en cliente (UI) y servidor (autoridad).

export const LETTERS = ["B", "I", "N", "G", "O"] as const;
export type Letter = (typeof LETTERS)[number];

export const FREE_INDEX = 12;
export const MAX_CARDS = 3;

export type WinningPattern = "LINE" | "FULL" | "X" | "CROSS" | "CORNERS";

export const PATTERNS: Record<WinningPattern, { label: string; description: string }> = {
  LINE: { label: "Línea", description: "Cualquier fila, columna o diagonal" },
  FULL: { label: "Cartón Lleno", description: "Todos los números del cartón" },
  X: { label: "Letra X", description: "Las dos diagonales principales" },
  CROSS: { label: "Cruz", description: "Fila y columna central" },
  CORNERS: { label: "4 Esquinas", description: "Solo las esquinas del cartón" },
};

/** Letra que corresponde a una bola (1-75). */
export function letterOf(n: number): Letter {
  const i = Math.floor((n - 1) / 15);
  return LETTERS[Math.min(Math.max(i, 0), 4)]!;
}

export function ballLabel(n: number): string {
  return `${letterOf(n)} ${n}`;
}

/** Rango de números de una columna (0-4). */
export function columnRange(col: number): number[] {
  const start = col * 15 + 1;
  return Array.from({ length: 15 }, (_, i) => start + i);
}

/** Los 75 números agrupados por letra. */
export function allBallsByLetter(): { letter: Letter; numbers: number[] }[] {
  return LETTERS.map((letter, col) => ({ letter, numbers: columnRange(col) }));
}

/**
 * Genera un cartón: 25 posiciones en orden de filas (index = fila * 5 + columna).
 * El centro (index 12) es 0 = FREE. Cada columna usa números únicos de su rango.
 */
export function generateCard(): number[] {
  const card = new Array<number>(25).fill(0);
  for (let col = 0; col < 5; col++) {
    const pool = columnRange(col);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j]!, pool[i]!];
    }
    const picked = pool.slice(0, 5);
    for (let row = 0; row < 5; row++) {
      const index = row * 5 + col;
      card[index] = index === FREE_INDEX ? 0 : picked[row]!;
    }
  }
  return card;
}

/** Todas las líneas posibles (filas, columnas y diagonales) como índices del cartón. */
export const LINES: number[][] = (() => {
  const lines: number[][] = [];
  for (let row = 0; row < 5; row++) lines.push([0, 1, 2, 3, 4].map((c) => row * 5 + c));
  for (let col = 0; col < 5; col++) lines.push([0, 1, 2, 3, 4].map((r) => r * 5 + col));
  lines.push([0, 6, 12, 18, 24]);
  lines.push([4, 8, 12, 16, 20]);
  return lines;
})();

/** Índices requeridos para otros patrones */
export const PATTERN_INDICES: Record<Exclude<WinningPattern, "LINE">, number[]> = {
  FULL: Array.from({ length: 25 }, (_, i) => i),
  X: [0, 6, 12, 18, 24, 4, 8, 16, 20],
  CROSS: [2, 7, 12, 17, 22, 10, 11, 13, 14],
  CORNERS: [0, 4, 20, 24],
};

/** ¿Se cumple el patrón según las casillas marcadas manualmente? (uso en cliente) */
export function isPatternAchieved(marked: boolean[], pattern: WinningPattern = "LINE"): boolean {
  if (pattern === "LINE") {
    return LINES.some((line) => line.every((i) => i === FREE_INDEX || marked[i] === true));
  }
  const required = PATTERN_INDICES[pattern];
  return required.every((i) => i === FREE_INDEX || marked[i] === true);
}

/** ¿El cartón realmente cumple el patrón con las bolas que salieron? (autoridad del servidor) */
export function checkWinServer(numbers: number[], drawn: number[], pattern: WinningPattern = "LINE"): boolean {
  const set = new Set(drawn);
  const isMarked = (i: number) => i === FREE_INDEX || set.has(numbers[i]!);

  if (pattern === "LINE") {
    return LINES.some((line) => line.every(isMarked));
  }
  const required = PATTERN_INDICES[pattern];
  return required.every(isMarked);
}

/** Devuelve la lista de números que le faltan a un cartón para cumplir un patrón (autoridad del servidor) */
export function getMissingNumbersServer(numbers: number[], drawn: number[], pattern: WinningPattern = "LINE"): number[] {
  const set = new Set(drawn);
  const isMarked = (i: number) => i === FREE_INDEX || set.has(numbers[i]!);

  if (pattern === "LINE") {
    // Para LINE, buscamos la línea que esté más cerca de completarse (menos faltantes)
    let bestMissing: number[] = Array.from({ length: 5 }, (_, i) => i); // Inicializar con algo largo

    for (const line of LINES) {
      const missing = line.filter(i => i !== FREE_INDEX && !set.has(numbers[i]!)).map(i => numbers[i]!);
      if (missing.length < bestMissing.length) {
        bestMissing = missing;
      }
      if (bestMissing.length === 0) break;
    }
    return bestMissing;
  }

  const required = PATTERN_INDICES[pattern];
  return required.filter(i => i !== FREE_INDEX && !set.has(numbers[i]!)).map(i => numbers[i]!);
}

// Deprecated aliases for backward compatibility if needed temporarily
export function hasMarkedLine(marked: boolean[]): boolean { return isPatternAchieved(marked, "LINE"); }
export function hasLineWithDrawn(numbers: number[], drawn: number[]): boolean { return checkWinServer(numbers, drawn, "LINE"); }
