import { create } from 'zustand';
import { BUILDINGS_BY_ID, TERRAIN_COST } from '../data/buildings';
import { DAYS_PER_SEASON, SEASON_ORDER } from '../data/terrain';
import { createInitialTerrain } from '../sim/mapgen';
import { simulateDay } from '../sim/simulation';
import { canPaintTerrain, canPlaceBuilding, inBounds } from '../engine/validity';
import type {
  HistoryPoint,
  PlacedObject,
  Season,
  StaffMember,
  StaffType,
  TerrainType,
  ToolMode,
} from '../types';

export const GRID_SIZE = 28;
const STARTING_MONEY = 8000;
const MAX_HISTORY = 60;

export interface SerializedGame {
  version: 1;
  gridSize: number;
  terrain: TerrainType[][];
  objects: Record<string, PlacedObject>;
  money: number;
  day: number;
  year: number;
  season: Season;
  satisfaction: number;
  staff: StaffMember[];
  history: HistoryPoint[];
}

interface GameState {
  gridSize: number;
  terrain: TerrainType[][];
  objects: Record<string, PlacedObject>;
  occupancy: Record<string, string>;
  money: number;
  day: number;
  year: number;
  season: Season;
  satisfaction: number;
  speed: 0 | 1 | 2 | 4;
  tool: ToolMode;
  staff: StaffMember[];
  history: HistoryPoint[];
  gameOver: boolean;
  negativeStreak: number;
  lastIncome: number;
  lastUpkeep: number;
  lastNewGuests: number;
  toast: string | null;

  setTool: (tool: ToolMode) => void;
  interactAt: (x: number, y: number) => void;
  demolishObject: (id: string) => void;
  tick: () => void;
  setSpeed: (speed: 0 | 1 | 2 | 4) => void;
  hireStaff: (type: StaffType) => void;
  fireStaff: (id: string) => void;
  resetGame: () => void;
  loadFromSave: (save: SerializedGame) => void;
  serialize: () => SerializedGame;
  dismissToast: () => void;
}

function key(x: number, y: number): string {
  return `${x},${y}`;
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function footprintCells(x: number, y: number, w: number, h: number): [number, number][] {
  const cells: [number, number][] = [];
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      cells.push([x + dx, y + dy]);
    }
  }
  return cells;
}

export const useGameStore = create<GameState>((set, get) => ({
  gridSize: GRID_SIZE,
  terrain: createInitialTerrain(GRID_SIZE),
  objects: {},
  occupancy: {},
  money: STARTING_MONEY,
  day: 1,
  year: 1,
  season: 'spring',
  satisfaction: 55,
  speed: 1,
  tool: { kind: 'select' },
  staff: [],
  history: [],
  gameOver: false,
  negativeStreak: 0,
  lastIncome: 0,
  lastUpkeep: 0,
  lastNewGuests: 0,
  toast: null,

  setTool: (tool) => set({ tool }),

  dismissToast: () => set({ toast: null }),

  demolishObject: (id) => {
    const state = get();
    const obj = state.objects[id];
    if (!obj) return;
    const def = BUILDINGS_BY_ID[obj.defId];
    if (!def) return;
    const cells = footprintCells(obj.x, obj.y, def.w, def.h);
    const nextOccupancy = { ...state.occupancy };
    for (const [cx, cy] of cells) delete nextOccupancy[key(cx, cy)];
    const nextObjects = { ...state.objects };
    delete nextObjects[id];
    const refund = Math.round(def.cost * 0.3);
    set({ objects: nextObjects, occupancy: nextOccupancy, money: state.money + refund });
  },

  interactAt: (x, y) => {
    const state = get();
    if (!inBounds(x, y, state.gridSize) || state.gameOver) return;
    const tool = state.tool;

    if (tool.kind === 'select') return;

    if (tool.kind === 'bulldoze') {
      const objId = state.occupancy[key(x, y)];
      if (!objId) return;
      get().demolishObject(objId);
      return;
    }

    if (tool.kind === 'terrain') {
      if (!canPaintTerrain(x, y, state.occupancy, state.gridSize)) {
        set({ toast: 'toast.tileOccupied' });
        return;
      }
      const cost = TERRAIN_COST[tool.terrain] ?? 0;
      if (state.money < cost) {
        set({ toast: 'toast.notEnoughMoney' });
        return;
      }
      if (state.terrain[y][x] === tool.terrain) return;
      const nextTerrain = state.terrain.map((row) => row.slice());
      nextTerrain[y][x] = tool.terrain;
      set({ terrain: nextTerrain, money: state.money - cost });
      return;
    }

    if (tool.kind === 'build') {
      const def = BUILDINGS_BY_ID[tool.defId];
      if (!def) return;
      if (state.money < def.cost) {
        set({ toast: 'toast.notEnoughMoney' });
        return;
      }
      if (!canPlaceBuilding(def.id, x, y, state.terrain, state.occupancy, state.gridSize)) {
        set({ toast: 'toast.badPlacement' });
        return;
      }
      const cells = footprintCells(x, y, def.w, def.h);
      const id = makeId();
      const newObj: PlacedObject = { id, defId: def.id, x, y, occupied: false, occupiedUntilDay: 0 };
      const nextOccupancy = { ...state.occupancy };
      for (const [cx, cy] of cells) nextOccupancy[key(cx, cy)] = id;
      set({
        objects: { ...state.objects, [id]: newObj },
        occupancy: nextOccupancy,
        money: state.money - def.cost,
      });
    }
  },

  tick: () => {
    const state = get();
    if (state.gameOver) return;
    const result = simulateDay(
      { objects: state.objects, money: state.money, day: state.day, satisfaction: state.satisfaction, staff: state.staff },
      state.season,
    );

    const nextDay = state.day + 1;
    let nextSeason = state.season;
    let nextYear = state.year;
    if (nextDay % DAYS_PER_SEASON === 1) {
      const idx = SEASON_ORDER.indexOf(state.season);
      const nextIdx = (idx + 1) % SEASON_ORDER.length;
      nextSeason = SEASON_ORDER[nextIdx];
      if (nextIdx === 0) nextYear += 1;
    }

    const nextHistory: HistoryPoint[] = [
      ...state.history,
      { day: state.day, money: result.money, satisfaction: result.satisfaction, occupancyRate: result.occupancyRate },
    ].slice(-MAX_HISTORY);

    const negativeStreak = result.money < 0 ? state.negativeStreak + 1 : 0;
    const gameOver = negativeStreak >= 14;

    set({
      objects: result.objects,
      money: result.money,
      satisfaction: result.satisfaction,
      day: nextDay,
      season: nextSeason,
      year: nextYear,
      history: nextHistory,
      lastIncome: result.income,
      lastUpkeep: result.upkeepTotal,
      lastNewGuests: result.newGuests,
      negativeStreak,
      gameOver,
      speed: gameOver ? 0 : state.speed,
    });
  },

  setSpeed: (speed) => set({ speed }),

  hireStaff: (type) => {
    const state = get();
    set({ staff: [...state.staff, { id: makeId(), type }] });
  },

  fireStaff: (id) => {
    const state = get();
    set({ staff: state.staff.filter((s) => s.id !== id) });
  },

  resetGame: () =>
    set({
      gridSize: GRID_SIZE,
      terrain: createInitialTerrain(GRID_SIZE),
      objects: {},
      occupancy: {},
      money: STARTING_MONEY,
      day: 1,
      year: 1,
      season: 'spring',
      satisfaction: 55,
      speed: 1,
      tool: { kind: 'select' },
      staff: [],
      history: [],
      gameOver: false,
      negativeStreak: 0,
      lastIncome: 0,
      lastUpkeep: 0,
      lastNewGuests: 0,
      toast: null,
    }),

  loadFromSave: (save) => {
    const occupancy: Record<string, string> = {};
    for (const obj of Object.values(save.objects)) {
      const def = BUILDINGS_BY_ID[obj.defId];
      if (!def) continue;
      for (const [cx, cy] of footprintCells(obj.x, obj.y, def.w, def.h)) {
        occupancy[key(cx, cy)] = obj.id;
      }
    }
    set({
      gridSize: save.gridSize,
      terrain: save.terrain,
      objects: save.objects,
      occupancy,
      money: save.money,
      day: save.day,
      year: save.year,
      season: save.season,
      satisfaction: save.satisfaction,
      staff: save.staff,
      history: save.history,
      speed: 1,
      tool: { kind: 'select' },
      gameOver: false,
      negativeStreak: 0,
      toast: null,
    });
  },

  serialize: () => {
    const state = get();
    return {
      version: 1,
      gridSize: state.gridSize,
      terrain: state.terrain,
      objects: state.objects,
      money: state.money,
      day: state.day,
      year: state.year,
      season: state.season,
      satisfaction: state.satisfaction,
      staff: state.staff,
      history: state.history,
    };
  },
}));
