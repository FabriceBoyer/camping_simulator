import type { Camera } from '../types';

export const TILE_WIDTH = 64;
export const TILE_HEIGHT = 32;

export interface ScreenPoint {
  x: number;
  y: number;
}

/** Projects grid coordinates to world (pre-camera) screen space. */
export function gridToWorld(gx: number, gy: number): ScreenPoint {
  return {
    x: (gx - gy) * (TILE_WIDTH / 2),
    y: (gx + gy) * (TILE_HEIGHT / 2),
  };
}

/** Converts a canvas point to fractional grid coordinates, accounting for camera pan/zoom. */
export function screenToGrid(sx: number, sy: number, camera: Camera): { x: number; y: number } {
  const wx = (sx - camera.x) / camera.zoom;
  const wy = (sy - camera.y) / camera.zoom;
  const gx = (wx / (TILE_WIDTH / 2) + wy / (TILE_HEIGHT / 2)) / 2;
  const gy = (wy / (TILE_HEIGHT / 2) - wx / (TILE_WIDTH / 2)) / 2;
  return { x: gx, y: gy };
}

export function worldToScreen(wx: number, wy: number, camera: Camera): ScreenPoint {
  return { x: wx * camera.zoom + camera.x, y: wy * camera.zoom + camera.y };
}
