import { BUILDINGS_BY_ID } from '../data/buildings';
import { TERRAIN_COLORS } from '../data/terrain';
import type { Camera, PlacedObject, TerrainType } from '../types';
import { TILE_HEIGHT, TILE_WIDTH, gridToWorld } from './coords';
import { drawBuildingSprite } from './buildingSprites';
import { seeded } from './shapes';
import type { WalkingGuest } from './guests';

export interface HoverPreview {
  x: number;
  y: number;
  w: number;
  h: number;
  valid: boolean;
}

function diamondPoints(gx: number, gy: number, w: number, h: number, elev = 0) {
  const top = gridToWorld(gx, gy);
  const right = gridToWorld(gx + w, gy);
  const bottom = gridToWorld(gx + w, gy + h);
  const left = gridToWorld(gx, gy + h);
  return [top, right, bottom, left].map((p) => ({ x: p.x, y: p.y - elev }));
}

function fillPoly(ctx: CanvasRenderingContext2D, pts: { x: number; y: number }[], fill: string) {
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function drawTerrainTile(ctx: CanvasRenderingContext2D, gx: number, gy: number, terrain: TerrainType) {
  const pts = diamondPoints(gx, gy, 1, 1);
  fillPoly(ctx, pts, TERRAIN_COLORS[terrain]);
  ctx.strokeStyle = 'rgba(0,0,0,0.06)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
  ctx.stroke();

  const center = gridToWorld(gx + 0.5, gy + 0.5);
  const n = seeded(gx * 97 + gy * 13.37);
  if (terrain === 'grass') {
    ctx.strokeStyle = 'rgba(30,70,25,0.25)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      const a = seeded(gx * 3 + gy * 7 + i * 11) * Math.PI * 2;
      const r = 3 + seeded(gx + gy * 5 + i) * 6;
      const px = center.x + Math.cos(a) * r * 1.6;
      const py = center.y + Math.sin(a) * r * 0.8 - 8;
      ctx.beginPath();
      ctx.moveTo(px, py + 4);
      ctx.quadraticCurveTo(px + 1.5, py, px + 3, py - 3);
      ctx.stroke();
    }
  } else if (terrain === 'sand') {
    ctx.fillStyle = 'rgba(120,95,50,0.2)';
    for (let i = 0; i < 4; i++) {
      const a = seeded(gx * 5 + gy * 3 + i * 9) * Math.PI * 2;
      const r = seeded(gx + gy + i * 17) * 12;
      ctx.beginPath();
      ctx.arc(center.x + Math.cos(a) * r * 1.4, center.y + Math.sin(a) * r * 0.7, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (terrain === 'road') {
    if (n > 0.5) {
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(center.x - 8, center.y);
      ctx.lineTo(center.x + 8, center.y);
      ctx.stroke();
    }
  } else if (terrain === 'water') {
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(center.x, center.y, 10, 4, 0, 0.2, 2.5);
    ctx.stroke();
  }
}

function drawGuest(ctx: CanvasRenderingContext2D, guest: WalkingGuest, timeMs: number) {
  const world = gridToWorld(guest.x, guest.y);

  if (guest.activity === 'swimming') {
    const bob = Math.sin(timeMs / 260 + guest.bobSeed) * 1.2;
    ctx.beginPath();
    ctx.ellipse(world.x, world.y + 1, 6, 2.4, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(world.x, world.y - 1 + bob * 0.4, 3.6, 1.8, 0, 0, Math.PI * 2);
    ctx.fillStyle = guest.color;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(world.x, world.y - 3 + bob * 0.4, 2.6, 0, Math.PI * 2);
    ctx.fillStyle = '#f2c9a0';
    ctx.fill();
    return;
  }

  const sitting = guest.activity === 'sitting';
  const bobAmp = guest.activity === 'playing' ? 2.4 : 1.4;
  const bob = Math.sin(timeMs / (sitting ? 900 : 220) + guest.bobSeed) * bobAmp;
  const bodyH = sitting ? 3.4 : 5.5;
  const bodyLift = sitting ? 4 : 7;
  const headLift = sitting ? 8 : 13.5;

  ctx.beginPath();
  ctx.ellipse(world.x, world.y, 4.5, 2, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(world.x, world.y - bodyLift + bob * 0.3, 3.4, bodyH, 0, 0, Math.PI * 2);
  ctx.fillStyle = guest.color;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(world.x, world.y - headLift + bob * 0.3, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#f2c9a0';
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 0.8;
  ctx.stroke();
}

export interface RenderInput {
  gridSize: number;
  terrain: TerrainType[][];
  objects: Record<string, PlacedObject>;
  hover: HoverPreview | null;
  guests: WalkingGuest[];
  timeMs: number;
  movingId?: string | null;
}

export function renderScene(
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  cssWidth: number,
  cssHeight: number,
  input: RenderInput,
) {
  const dpr = window.devicePixelRatio || 1;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  // Fully transparent: the sky/clouds are a CSS layer behind the canvas so
  // they can drift for free without waking up the render loop.
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  ctx.save();
  ctx.translate(camera.x, camera.y);
  ctx.scale(camera.zoom, camera.zoom);

  const { gridSize, terrain, objects, hover, guests, timeMs, movingId } = input;

  for (let s = 0; s < gridSize * 2; s++) {
    for (let x = 0; x < gridSize; x++) {
      const y = s - x;
      if (y < 0 || y >= gridSize) continue;
      drawTerrainTile(ctx, x, y, terrain[y][x]);
    }
  }

  type DrawItem =
    | { depth: number; kind: 'building'; obj: PlacedObject }
    | { depth: number; kind: 'guest'; guest: WalkingGuest };

  const items: DrawItem[] = [];
  for (const obj of Object.values(objects)) {
    const def = BUILDINGS_BY_ID[obj.defId];
    if (!def) continue;
    items.push({ depth: obj.x + def.w / 2 + (obj.y + def.h), kind: 'building', obj });
  }
  for (const guest of guests) {
    items.push({ depth: guest.x + guest.y, kind: 'guest', guest });
  }
  items.sort((a, b) => a.depth - b.depth);

  for (const item of items) {
    if (item.kind === 'guest') {
      drawGuest(ctx, item.guest, timeMs);
      continue;
    }
    const obj = item.obj;
    const def = BUILDINGS_BY_ID[obj.defId];
    if (!def) continue;
    const anchor = gridToWorld(obj.x + def.w / 2, obj.y + def.h);
    const scale = (def.w + def.h) / 2;
    const isMoving = obj.id === movingId;
    if (isMoving) ctx.globalAlpha = 0.35;
    drawBuildingSprite(ctx, def.id, anchor.x, anchor.y, scale, def.color, hashId(obj.id), timeMs);
    if (isMoving) ctx.globalAlpha = 1;

    if (def.category === 'pitch' && obj.occupied) {
      const badge = gridToWorld(obj.x + def.w, obj.y);
      ctx.beginPath();
      ctx.arc(badge.x, badge.y - 26, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#2ecc71';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  if (hover) {
    const pts = diamondPoints(hover.x, hover.y, hover.w, hover.h, 2);
    fillPoly(ctx, pts, hover.valid ? 'rgba(46,204,113,0.45)' : 'rgba(231,76,60,0.45)');
    ctx.strokeStyle = hover.valid ? '#27ae60' : '#c0392b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();
    ctx.stroke();
  }

  ctx.restore();
}

export { TILE_WIDTH, TILE_HEIGHT };
