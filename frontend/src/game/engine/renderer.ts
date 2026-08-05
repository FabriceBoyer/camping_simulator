import { BUILDINGS_BY_ID } from '../data/buildings';
import { TERRAIN_COLORS } from '../data/terrain';
import type { ActiveEvent, Camera, PlacedObject, TerrainType } from '../types';
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

function drawDisasterEffect(
  ctx: CanvasRenderingContext2D,
  type: ActiveEvent['type'],
  cx: number,
  cy: number,
  timeMs: number,
) {
  ctx.save();

  if (type === 'fire') {
    ctx.beginPath();
    ctx.ellipse(cx, cy, 24, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,120,40,0.22)';
    ctx.fill();
    for (let i = 0; i < 6; i++) {
      const cycle = 2200;
      const phase = ((timeMs + i * 350) % cycle) / cycle;
      const drift = (seeded(i * 13.7) * 2 - 1) * 12;
      const px = cx + drift * phase;
      const py = cy - phase * 60 - 6;
      ctx.beginPath();
      ctx.arc(px, py, 5 + phase * 10, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(70,70,75,${0.35 * (1 - phase)})`;
      ctx.fill();
    }
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + timeMs / 400;
      const fx = cx + Math.cos(a) * 12;
      const fy = cy + Math.sin(a) * 5;
      const flicker = Math.sin(timeMs / 150 + i) * 3;
      ctx.beginPath();
      ctx.moveTo(fx - 3, fy);
      ctx.lineTo(fx, fy - 10 - flicker);
      ctx.lineTo(fx + 3, fy);
      ctx.closePath();
      ctx.fillStyle = '#ff7b00';
      ctx.fill();
    }
  } else if (type === 'tornado') {
    const height = 70;
    ctx.strokeStyle = 'rgba(120,120,130,0.55)';
    ctx.lineWidth = 2;
    for (let ring = 0; ring < 6; ring++) {
      const ry = cy - (ring / 6) * height;
      const rx = 6 + (ring / 6) * 22;
      const rot = timeMs / 200 + ring;
      ctx.beginPath();
      ctx.ellipse(cx, ry, rx, 4, rot, 0, Math.PI * 2);
      ctx.stroke();
    }
    for (let i = 0; i < 4; i++) {
      const a = timeMs / 180 + (i / 4) * Math.PI * 2;
      const r = 18 + Math.sin(timeMs / 300 + i) * 4;
      const dx = cx + Math.cos(a) * r;
      const dy = cy - 20 + Math.sin(a) * r * 0.4;
      ctx.beginPath();
      ctx.arc(dx, dy, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#8d99ae';
      ctx.fill();
    }
  } else {
    const pulse = 0.5 + Math.sin(timeMs / 350) * 0.2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 22, 10, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,80,20,${0.3 * pulse})`;
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx, cy, 12, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,150,40,${0.5 * pulse})`;
    ctx.fill();
    for (let i = 0; i < 5; i++) {
      const cycle = 1800;
      const phase = ((timeMs + i * 300) % cycle) / cycle;
      const drift = (seeded(i * 7.1) * 2 - 1) * 8;
      const px = cx + drift * phase;
      const py = cy - phase * 70 - 4;
      ctx.beginPath();
      ctx.arc(px, py, 4 + phase * 6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(50,45,45,${0.4 * (1 - phase)})`;
      ctx.fill();
    }
  }

  ctx.restore();
}

function drawRain(
  ctx: CanvasRenderingContext2D,
  cssWidth: number,
  cssHeight: number,
  timeMs: number,
  intensity: number,
) {
  const dropCount = Math.round(40 * intensity);
  ctx.save();
  ctx.strokeStyle = `rgba(190,215,235,${0.35 * intensity})`;
  ctx.lineWidth = 1;
  for (let i = 0; i < dropCount; i++) {
    const seedX = seeded(i * 12.9);
    const seedSpeed = 0.6 + seeded(i * 7.3) * 0.6;
    const fallDuration = 700 / seedSpeed;
    const t = ((timeMs + i * 137) % fallDuration) / fallDuration;
    const x = seedX * (cssWidth + 60) - 30 + t * 18;
    const y = t * (cssHeight + 40) - 20;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 5, y + 12);
    ctx.stroke();
  }
  ctx.restore();
}

export interface RenderInput {
  gridSize: number;
  terrain: TerrainType[][];
  objects: Record<string, PlacedObject>;
  hover: HoverPreview | null;
  guests: WalkingGuest[];
  timeMs: number;
  movingId?: string | null;
  weather?: 'sunny' | 'cloudy' | 'rain' | 'storm';
  activeEvent?: ActiveEvent | null;
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
    // Centroid of the footprint diamond (gridToWorld is linear, so the
    // image of the rectangle's center is exactly the diamond's visual
    // center) — this must match where the build/move ghost preview is
    // drawn, or sprites drift sideways relative to their actual tiles.
    const anchor = gridToWorld(obj.x + def.w / 2, obj.y + def.h / 2);
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

  if (input.activeEvent) {
    const epicenter = gridToWorld(input.activeEvent.x, input.activeEvent.y);
    drawDisasterEffect(ctx, input.activeEvent.type, epicenter.x, epicenter.y, timeMs);
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

  if (input.weather === 'rain' || input.weather === 'storm') {
    drawRain(ctx, cssWidth, cssHeight, timeMs, input.weather === 'storm' ? 1.6 : 1);
  }
}

export { TILE_WIDTH, TILE_HEIGHT };
