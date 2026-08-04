import { BUILDINGS_BY_ID } from '../data/buildings';
import type { PlacedObject, TerrainType } from '../types';

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

/** Returns a copy of `occupancy` with the given object's own footprint cells
 * cleared, so it can be validated as a candidate move destination without
 * colliding with itself. */
export function occupancyWithoutObject(
  occupancy: Record<string, string>,
  objects: Record<string, PlacedObject>,
  id: string,
): Record<string, string> {
  const obj = objects[id];
  if (!obj) return occupancy;
  const def = BUILDINGS_BY_ID[obj.defId];
  if (!def) return occupancy;
  const next = { ...occupancy };
  for (let dy = 0; dy < def.h; dy++) {
    for (let dx = 0; dx < def.w; dx++) {
      delete next[`${obj.x + dx},${obj.y + dy}`];
    }
  }
  return next;
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
