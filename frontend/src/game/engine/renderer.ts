import { BUILDINGS_BY_ID } from '../data/buildings';
import { TERRAIN_COLORS } from '../data/terrain';
import type { Camera, PlacedObject, TerrainType } from '../types';
import { TILE_HEIGHT, TILE_WIDTH, gridToWorld } from './coords';

export interface HoverPreview {
  x: number;
  y: number;
  w: number;
  h: number;
  valid: boolean;
}

const ELEVATION: Record<string, number> = {
  pitch: 12,
  amenity: 20,
  decoration: 8,
};

function shade(hex: string, factor: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, Math.round(((n >> 16) & 255) * factor)));
  const g = Math.max(0, Math.min(255, Math.round(((n >> 8) & 255) * factor)));
  const b = Math.max(0, Math.min(255, Math.round((n & 255) * factor)));
  return `rgb(${r},${g},${b})`;
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

function drawTerrainTile(ctx: CanvasRenderingContext2D, gx: number, gy: number, terrain: TerrainType) {
  const pts = diamondPoints(gx, gy, 1, 1);
  fillPoly(ctx, pts, TERRAIN_COLORS[terrain]);
  ctx.strokeStyle = 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
  ctx.stroke();
}

function drawBlock(
  ctx: CanvasRenderingContext2D,
  gx: number,
  gy: number,
  w: number,
  h: number,
  color: string,
  elev: number,
) {
  const top = gridToWorld(gx, gy);
  const right = gridToWorld(gx + w, gy);
  const bottom = gridToWorld(gx + w, gy + h);
  const left = gridToWorld(gx, gy + h);

  // Left face (south-west facing)
  fillPoly(
    ctx,
    [
      { x: left.x, y: left.y },
      { x: bottom.x, y: bottom.y },
      { x: bottom.x, y: bottom.y - elev },
      { x: left.x, y: left.y - elev },
    ],
    shade(color, 0.65),
  );
  // Right face (south-east facing)
  fillPoly(
    ctx,
    [
      { x: right.x, y: right.y },
      { x: bottom.x, y: bottom.y },
      { x: bottom.x, y: bottom.y - elev },
      { x: right.x, y: right.y - elev },
    ],
    shade(color, 0.82),
  );
  // Roof
  fillPoly(
    ctx,
    [
      { x: top.x, y: top.y - elev },
      { x: right.x, y: right.y - elev },
      { x: bottom.x, y: bottom.y - elev },
      { x: left.x, y: left.y - elev },
    ],
    shade(color, 1.05),
  );
}

function drawIcon(ctx: CanvasRenderingContext2D, gx: number, gy: number, w: number, h: number, elev: number, icon: string) {
  const center = gridToWorld(gx + w / 2, gy + h / 2);
  const fontSize = 15 + Math.min(w, h) * 6;
  ctx.font = `${fontSize}px "Apple Color Emoji","Segoe UI Emoji",sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(icon, center.x, center.y - elev - fontSize * 0.15);
}

export interface RenderInput {
  gridSize: number;
  terrain: TerrainType[][];
  objects: Record<string, PlacedObject>;
  hover: HoverPreview | null;
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
  ctx.clearRect(0, 0, cssWidth, cssHeight);
  ctx.fillStyle = '#bfe3f0';
  ctx.fillRect(0, 0, cssWidth, cssHeight);

  ctx.save();
  ctx.translate(camera.x, camera.y);
  ctx.scale(camera.zoom, camera.zoom);

  const { gridSize, terrain, objects, hover } = input;

  for (let s = 0; s < gridSize * 2; s++) {
    for (let x = 0; x < gridSize; x++) {
      const y = s - x;
      if (y < 0 || y >= gridSize) continue;
      drawTerrainTile(ctx, x, y, terrain[y][x]);
    }
  }

  const objList = Object.values(objects).sort((a, b) => a.x + a.y - (b.x + b.y));
  for (const obj of objList) {
    const def = BUILDINGS_BY_ID[obj.defId];
    if (!def) continue;
    const elev = ELEVATION[def.category] ?? 10;
    drawBlock(ctx, obj.x, obj.y, def.w, def.h, def.color, elev);
    drawIcon(ctx, obj.x, obj.y, def.w, def.h, elev, def.icon);
    if (def.category === 'pitch' && obj.occupied) {
      const corner = gridToWorld(obj.x + def.w, obj.y);
      ctx.beginPath();
      ctx.arc(corner.x, corner.y - elev, 5, 0, Math.PI * 2);
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
