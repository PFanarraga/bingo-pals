// Lógica pura del Bingo 75. Se usa en cliente (UI) y servidor (autoridad).

export const LETTERS = ["B", "I", "N", "G", "O"] as const;
export type Letter = (typeof LETTERS)[number];

export const FREE_INDEX = 12;
export const MAX_CARDS = 3;

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

export function isValidCard(numbers: unknown): numbers is number[] {
  if (!Array.isArray(numbers) || numbers.length !== 25) return false;
  for (let i = 0; i < 25; i++) {
    const n = numbers[i];
    if (typeof n !== "number") return false;
    if (i === FREE_INDEX) {
      if (n !== 0) return false;
      continue;
    }
    const col = i % 5;
    if (n < col * 15 + 1 || n > col * 15 + 15) return false;
  }
  return true;
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

/** ¿Hay línea completa según las casillas marcadas manualmente? (uso en cliente) */
export function hasMarkedLine(marked: boolean[]): boolean {
  return LINES.some((line) => line.every((i) => i === FREE_INDEX || marked[i] === true));
}

/** ¿El cartón realmente tiene línea con las bolas que salieron? (autoridad del servidor) */
export function hasLineWithDrawn(numbers: number[], drawn: number[]): boolean {
  const set = new Set(drawn);
  return LINES.some((line) => line.every((i) => i === FREE_INDEX || set.has(numbers[i]!)));
}
