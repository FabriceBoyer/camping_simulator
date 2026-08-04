import type { TerrainType } from '../types';

export interface WalkingGuest {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  color: string;
  bobSeed: number;
  idleUntil: number;
}

const GUEST_COLORS = ['#e76f51', '#2a9d8f', '#e9c46a', '#457b9d', '#f4a261', '#9d4edd', '#ef476f'];

function isWalkable(
  x: number,
  y: number,
  gridSize: number,
  terrain: TerrainType[][],
  occupancy: Record<string, string>,
): boolean {
  if (x < 0 || y < 0 || x >= gridSize || y >= gridSize) return false;
  const gx = Math.floor(x);
  const gy = Math.floor(y);
  if (terrain[gy]?.[gx] === 'water') return false;
  if (occupancy[`${gx},${gy}`]) return false;
  return true;
}

function pickTarget(
  from: { x: number; y: number },
  gridSize: number,
  terrain: TerrainType[][],
  occupancy: Record<string, string>,
): { x: number; y: number } {
  const roadTiles: [number, number][] = [];
  if (Math.random() < 0.55) {
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        if (terrain[y][x] === 'road') roadTiles.push([x, y]);
      }
    }
  }
  if (roadTiles.length > 0) {
    const [rx, ry] = roadTiles[Math.floor(Math.random() * roadTiles.length)];
    return { x: rx + 0.5, y: ry + 0.5 };
  }
  for (let attempt = 0; attempt < 12; attempt++) {
    const radius = 3 + Math.random() * 5;
    const angle = Math.random() * Math.PI * 2;
    const tx = from.x + Math.cos(angle) * radius;
    const ty = from.y + Math.sin(angle) * radius;
    if (isWalkable(tx, ty, gridSize, terrain, occupancy)) {
      return { x: Math.floor(tx) + 0.5, y: Math.floor(ty) + 0.5 };
    }
  }
  return { x: from.x, y: from.y };
}

export function spawnGuest(
  id: string,
  gridSize: number,
  terrain: TerrainType[][],
  occupancy: Record<string, string>,
): WalkingGuest {
  let x = gridSize / 2;
  let y = gridSize / 2;
  for (let attempt = 0; attempt < 30; attempt++) {
    const tx = Math.floor(Math.random() * gridSize) + 0.5;
    const ty = Math.floor(Math.random() * gridSize) + 0.5;
    if (isWalkable(tx, ty, gridSize, terrain, occupancy)) {
      x = tx;
      y = ty;
      break;
    }
  }
  const target = pickTarget({ x, y }, gridSize, terrain, occupancy);
  return {
    id,
    x,
    y,
    targetX: target.x,
    targetY: target.y,
    speed: 0.6 + Math.random() * 0.5,
    color: GUEST_COLORS[Math.floor(Math.random() * GUEST_COLORS.length)],
    bobSeed: Math.random() * Math.PI * 2,
    idleUntil: 0,
  };
}

export function stepGuests(
  guests: WalkingGuest[],
  dtSeconds: number,
  gridSize: number,
  terrain: TerrainType[][],
  occupancy: Record<string, string>,
  now: number,
) {
  for (const g of guests) {
    if (g.idleUntil > now) continue;
    const dx = g.targetX - g.x;
    const dy = g.targetY - g.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 0.08) {
      if (Math.random() < 0.3) {
        g.idleUntil = now + 1500 + Math.random() * 3000;
      }
      const target = pickTarget({ x: g.x, y: g.y }, gridSize, terrain, occupancy);
      g.targetX = target.x;
      g.targetY = target.y;
      continue;
    }
    const step = Math.min(dist, g.speed * dtSeconds);
    g.x += (dx / dist) * step;
    g.y += (dy / dist) * step;
  }
}
