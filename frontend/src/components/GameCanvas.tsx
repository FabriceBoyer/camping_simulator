import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../game/state/store';
import { BUILDINGS_BY_ID } from '../game/data/buildings';
import { canPaintTerrain, canPlaceBuilding } from '../game/engine/validity';
import { screenToGrid } from '../game/engine/coords';
import { renderScene, type HoverPreview } from '../game/engine/renderer';
import type { Camera } from '../game/types';

interface SelectedInfo {
  id: string;
  defId: string;
  sx: number;
  sy: number;
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function midpoint(a: { x: number; y: number }, b: { x: number; y: number }) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export default function GameCanvas() {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef<Camera>({ x: 0, y: 0, zoom: 1 });
  const sizeRef = useRef({ w: 0, h: 0 });
  const centeredRef = useRef(false);
  const hoverRef = useRef<HoverPreview | null>(null);

  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const dragStartRef = useRef<{ x: number; y: number; camX: number; camY: number } | null>(null);
  const paintingRef = useRef(false);
  const lastPaintedCellRef = useRef<string | null>(null);
  const pinchRef = useRef<{ prevDist: number } | null>(null);
  const tapStartRef = useRef<{ x: number; y: number; t: number } | null>(null);

  const tool = useGameStore((s) => s.tool);
  const [selectedInfo, setSelectedInfo] = useState<SelectedInfo | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { terrain, objects, gridSize } = useGameStore.getState();
    renderScene(ctx, cameraRef.current, sizeRef.current.w, sizeRef.current.h, {
      gridSize,
      terrain,
      objects,
      hover: hoverRef.current,
    });
  }, []);

  const getPos = useCallback((e: PointerEvent | React.PointerEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { sx: e.clientX - rect.left, sy: e.clientY - rect.top };
  }, []);

  const updateHover = useCallback(
    (sx: number, sy: number) => {
      const state = useGameStore.getState();
      const currentTool = state.tool;
      const g = screenToGrid(sx, sy, cameraRef.current);
      const gx = Math.floor(g.x);
      const gy = Math.floor(g.y);

      if (currentTool.kind === 'build') {
        const def = BUILDINGS_BY_ID[currentTool.defId];
        if (!def) {
          hoverRef.current = null;
        } else {
          const valid =
            canPlaceBuilding(def.id, gx, gy, state.terrain, state.occupancy, state.gridSize) &&
            state.money >= def.cost;
          hoverRef.current = { x: gx, y: gy, w: def.w, h: def.h, valid };
        }
      } else if (currentTool.kind === 'terrain') {
        const valid = canPaintTerrain(gx, gy, state.occupancy, state.gridSize) && state.money >= 0;
        hoverRef.current = { x: gx, y: gy, w: 1, h: 1, valid };
      } else if (currentTool.kind === 'bulldoze') {
        const valid = !!state.occupancy[`${gx},${gy}`];
        hoverRef.current = { x: gx, y: gy, w: 1, h: 1, valid };
      } else {
        hoverRef.current = null;
      }
      draw();
    },
    [draw],
  );

  const paintCellAt = useCallback((sx: number, sy: number) => {
    const g = screenToGrid(sx, sy, cameraRef.current);
    const gx = Math.floor(g.x);
    const gy = Math.floor(g.y);
    const cellKey = `${gx},${gy}`;
    if (lastPaintedCellRef.current === cellKey) return;
    lastPaintedCellRef.current = cellKey;
    useGameStore.getState().interactAt(gx, gy);
  }, []);

  // Resize handling
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      sizeRef.current = { w: rect.width, h: rect.height };
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      if (!centeredRef.current && rect.width > 0) {
        cameraRef.current = { x: rect.width / 2, y: 70, zoom: Math.min(1, rect.width / 900) || 0.8 };
        centeredRef.current = true;
      }
      draw();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', resize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('orientationchange', resize);
    };
  }, [draw]);

  // Redraw whenever game state changes (build/tick/etc).
  useEffect(() => {
    const unsub = useGameStore.subscribe(() => draw());
    return unsub;
  }, [draw]);

  useEffect(() => {
    // Tool changed: clear stale hover/selection.
    hoverRef.current = null;
    setSelectedInfo(null);
    draw();
  }, [tool, draw]);

  // Pointer + wheel handling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onPointerDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      const { sx, sy } = getPos(e);
      pointersRef.current.set(e.pointerId, { x: sx, y: sy });
      setSelectedInfo(null);

      if (pointersRef.current.size === 1) {
        const currentTool = useGameStore.getState().tool;
        tapStartRef.current = { x: sx, y: sy, t: performance.now() };
        if (currentTool.kind === 'select') {
          dragStartRef.current = { x: sx, y: sy, camX: cameraRef.current.x, camY: cameraRef.current.y };
        } else {
          paintingRef.current = true;
          lastPaintedCellRef.current = null;
          paintCellAt(sx, sy);
        }
      } else if (pointersRef.current.size === 2) {
        paintingRef.current = false;
        dragStartRef.current = null;
        const pts = Array.from(pointersRef.current.values());
        pinchRef.current = { prevDist: distance(pts[0], pts[1]) };
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const { sx, sy } = getPos(e);
      if (pointersRef.current.has(e.pointerId)) {
        pointersRef.current.set(e.pointerId, { x: sx, y: sy });
      }

      if (pointersRef.current.size >= 2 && pinchRef.current) {
        const pts = Array.from(pointersRef.current.values()).slice(0, 2);
        const d = distance(pts[0], pts[1]);
        const mid = midpoint(pts[0], pts[1]);
        const factor = d / (pinchRef.current.prevDist || d);
        const camera = cameraRef.current;
        const newZoom = clamp(camera.zoom * factor, 0.45, 2.4);
        const wx = (mid.x - camera.x) / camera.zoom;
        const wy = (mid.y - camera.y) / camera.zoom;
        camera.zoom = newZoom;
        camera.x = mid.x - wx * newZoom;
        camera.y = mid.y - wy * newZoom;
        pinchRef.current.prevDist = d;
        draw();
        return;
      }

      if (pointersRef.current.size === 1) {
        if (dragStartRef.current) {
          const camera = cameraRef.current;
          camera.x = dragStartRef.current.camX + (sx - dragStartRef.current.x);
          camera.y = dragStartRef.current.camY + (sy - dragStartRef.current.y);
          draw();
          return;
        }
        if (paintingRef.current) {
          paintCellAt(sx, sy);
          return;
        }
      }

      if (e.pointerType === 'mouse') {
        updateHover(sx, sy);
      }
    };

    const endGesture = (e: PointerEvent) => {
      const { sx, sy } = getPos(e);
      const wasSingle = pointersRef.current.size === 1;
      pointersRef.current.delete(e.pointerId);

      if (pointersRef.current.size < 2) pinchRef.current = null;

      if (wasSingle && dragStartRef.current) {
        const start = tapStartRef.current;
        const moved = start ? distance({ x: sx, y: sy }, { x: start.x, y: start.y }) : 999;
        if (moved < 8) {
          const state = useGameStore.getState();
          const g = screenToGrid(sx, sy, cameraRef.current);
          const gx = Math.floor(g.x);
          const gy = Math.floor(g.y);
          const objId = state.occupancy[`${gx},${gy}`];
          if (objId) {
            const obj = state.objects[objId];
            setSelectedInfo({ id: objId, defId: obj.defId, sx, sy });
          }
        }
      }

      if (pointersRef.current.size === 0) {
        dragStartRef.current = null;
        paintingRef.current = false;
        lastPaintedCellRef.current = null;
        tapStartRef.current = null;
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const camera = cameraRef.current;
      const zoomFactor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      const newZoom = clamp(camera.zoom * zoomFactor, 0.45, 2.4);
      const wx = (sx - camera.x) / camera.zoom;
      const wy = (sy - camera.y) / camera.zoom;
      camera.zoom = newZoom;
      camera.x = sx - wx * newZoom;
      camera.y = sy - wy * newZoom;
      draw();
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', endGesture);
    canvas.addEventListener('pointercancel', endGesture);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', endGesture);
      canvas.removeEventListener('pointercancel', endGesture);
      canvas.removeEventListener('wheel', onWheel);
    };
  }, [draw, getPos, paintCellAt, updateHover]);

  const cursor = tool.kind === 'select' ? 'grab' : 'crosshair';
  const def = selectedInfo ? BUILDINGS_BY_ID[selectedInfo.defId] : null;

  return (
    <div ref={wrapRef} className="game-canvas-wrap">
      <canvas ref={canvasRef} style={{ cursor }} />
      {def && selectedInfo && (
        <div
          className="info-chip"
          style={{ left: selectedInfo.sx, top: selectedInfo.sy }}
        >
          <div className="info-chip-title">
            <span>{def.icon}</span> {t(def.nameKey)}
          </div>
          <button
            className="info-chip-demolish"
            onClick={() => {
              useGameStore.getState().demolishObject(selectedInfo.id);
              setSelectedInfo(null);
            }}
          >
            🗑️ {t('common.demolish')}
          </button>
        </div>
      )}
    </div>
  );
}
