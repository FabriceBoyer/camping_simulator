import { BUILDINGS_BY_ID } from '../data/buildings';
import type { TerrainType } from '../types';

export function inBounds(x: number, y: number, size: number): boolean {
  return x >= 0 && y >= 0 && x < size && y < size;
}

export function canPlaceBuilding(
  defId: string,
  x: number,
  y: number,
  terrain: TerrainType[][],
  occupancy: Record<string, string>,
  gridSize: number,
): boolean {
  const def = BUILDINGS_BY_ID[defId];
  if (!def) return false;
  for (let dy = 0; dy < def.h; dy++) {
    for (let dx = 0; dx < def.w; dx++) {
      const cx = x + dx;
      const cy = y + dy;
      if (!inBounds(cx, cy, gridSize)) return false;
      const t = terrain[cy][cx];
      if (t === 'water' || t === 'road') return false;
      if (occupancy[`${cx},${cy}`]) return false;
    }
  }
  return true;
}

export function canPaintTerrain(
  x: number,
  y: number,
  occupancy: Record<string, string>,
  gridSize: number,
): boolean {
  if (!inBounds(x, y, gridSize)) return false;
  return !occupancy[`${x},${y}`];
}
