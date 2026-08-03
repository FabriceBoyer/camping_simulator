import type { TerrainType } from '../types';

export function createInitialTerrain(size: number): TerrainType[][] {
  const grid: TerrainType[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => 'grass' as TerrainType),
  );

  // Small lake in the top-right corner.
  const lakeCx = size - 6;
  const lakeCy = 5;
  const lakeR = 4.2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const d = Math.hypot(x - lakeCx, y - lakeCy);
      if (d < lakeR) grid[y][x] = 'water';
      else if (d < lakeR + 1.3) grid[y][x] = 'sand';
    }
  }

  // Entrance road spine running along the bottom edge, then up the middle.
  const roadY = size - 3;
  for (let x = 2; x < size - 2; x++) {
    grid[roadY][x] = 'road';
  }
  const roadX = Math.floor(size / 2);
  for (let y = 4; y < roadY; y++) {
    grid[y][roadX] = 'road';
  }

  return grid;
}
