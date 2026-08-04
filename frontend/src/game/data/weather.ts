import type { Season, Weather } from '../types';

export const WEATHER_ICON: Record<Weather, string> = {
  sunny: '☀️',
  cloudy: '⛅',
  rain: '🌧️',
  storm: '⛈️',
};

/** Demand multiplier: guests are less likely to book (or enjoy) a rainy or
 * stormy camping trip. */
export const WEATHER_DEMAND_MULT: Record<Weather, number> = {
  sunny: 1.15,
  cloudy: 1,
  rain: 0.75,
  storm: 0.5,
};

export const WEATHER_SATISFACTION_DELTA: Record<Weather, number> = {
  sunny: 3,
  cloudy: 0,
  rain: -4,
  storm: -8,
};

const SEASON_WEATHER_WEIGHTS: Record<Season, Record<Weather, number>> = {
  spring: { sunny: 0.4, cloudy: 0.3, rain: 0.25, storm: 0.05 },
  summer: { sunny: 0.65, cloudy: 0.2, rain: 0.1, storm: 0.05 },
  autumn: { sunny: 0.25, cloudy: 0.35, rain: 0.3, storm: 0.1 },
  winter: { sunny: 0.2, cloudy: 0.3, rain: 0.3, storm: 0.2 },
};

export function rollWeather(season: Season): Weather {
  const weights = SEASON_WEATHER_WEIGHTS[season];
  const r = Math.random();
  let acc = 0;
  for (const w of Object.keys(weights) as Weather[]) {
    acc += weights[w];
    if (r < acc) return w;
  }
  return 'sunny';
}
