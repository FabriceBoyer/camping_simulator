import type { Season, TerrainType } from '../types';

export const TERRAIN_COLORS: Record<TerrainType, string> = {
  grass: '#7cb668',
  road: '#9a9a92',
  sand: '#e6d2a1',
  water: '#4a90c2',
};

export const SEASON_MULTIPLIER: Record<Season, number> = {
  spring: 0.75,
  summer: 1.5,
  autumn: 0.6,
  winter: 0.25,
};

export const SEASON_ORDER: Season[] = ['spring', 'summer', 'autumn', 'winter'];

export const DAYS_PER_SEASON = 30;
