import { BUILDINGS_BY_ID } from '../data/buildings';
import { SEASON_MULTIPLIER } from '../data/terrain';
import type { PlacedObject, Season, StaffMember } from '../types';
import { STAFF_DEFS } from '../data/staff';

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export interface SimInput {
  objects: Record<string, PlacedObject>;
  money: number;
  day: number;
  satisfaction: number;
  staff: StaffMember[];
  priceMultiplier: number;
  /** Combined weather × disaster-aftermath × marketing-campaign multiplier. */
  externalDemandMultiplier: number;
  /** Combined weather + disaster-aftermath satisfaction adjustment. */
  externalSatisfactionDelta: number;
}

export interface SimResult {
  objects: Record<string, PlacedObject>;
  money: number;
  satisfaction: number;
  income: number;
  upkeepTotal: number;
  occupancyRate: number;
  newGuests: number;
  pitchCount: number;
  occupiedCount: number;
  sanitaryCount: number;
  pitchIncome: number;
  amenityIncome: number;
  buildingUpkeep: number;
  staffWages: number;
  demand: number;
}

export function simulateDay(input: SimInput, season: Season): SimResult {
  const {
    objects,
    money,
    day,
    satisfaction,
    staff,
    priceMultiplier,
    externalDemandMultiplier,
    externalSatisfactionDelta,
  } = input;
  const allObjects = Object.values(objects);
  const pitchObjects = allObjects.filter((o) => BUILDINGS_BY_ID[o.defId]?.category === 'pitch');
  const otherObjects = allObjects.filter((o) => BUILDINGS_BY_ID[o.defId]?.category !== 'pitch');

  const amenitySatisfaction = otherObjects.reduce(
    (sum, o) => sum + (BUILDINGS_BY_ID[o.defId]?.satisfaction ?? 0),
    0,
  );
  const staffSatisfaction = staff.reduce((sum, s) => sum + STAFF_DEFS[s.type].satisfaction, 0);
  const sanitaryCount = allObjects.filter((o) => o.defId === 'sanitaryBlock').length;

  const priceDemandFactor = clamp(2 - priceMultiplier, 0.3, 1.6);
  const demandBase = amenitySatisfaction / (pitchObjects.length * 2 + 15);
  const demand =
    clamp01(demandBase) *
    SEASON_MULTIPLIER[season] *
    clamp01(satisfaction / 100 + 0.2) *
    priceDemandFactor *
    externalDemandMultiplier;

  let newGuests = 0;
  const nextObjects: Record<string, PlacedObject> = { ...objects };

  for (const pitch of pitchObjects) {
    if (pitch.occupied && pitch.occupiedUntilDay > day) {
      continue; // guest still staying
    }
    const willOccupy = Math.random() < demand;
    if (willOccupy) {
      newGuests += 1;
      const stayLength = 1 + Math.floor(Math.random() * 4);
      nextObjects[pitch.id] = { ...pitch, occupied: true, occupiedUntilDay: day + stayLength };
    } else if (pitch.occupied) {
      nextObjects[pitch.id] = { ...pitch, occupied: false };
    }
  }

  const occupiedCount = Object.values(nextObjects).filter(
    (o) => BUILDINGS_BY_ID[o.defId]?.category === 'pitch' && o.occupied,
  ).length;
  const occupancyRate = pitchObjects.length > 0 ? occupiedCount / pitchObjects.length : 0;

  const pitchIncome = Math.round(
    Object.values(nextObjects)
      .filter((o) => BUILDINGS_BY_ID[o.defId]?.category === 'pitch' && o.occupied)
      .reduce((sum, o) => sum + (BUILDINGS_BY_ID[o.defId]?.income ?? 0), 0) * priceMultiplier,
  );

  const amenityIncome = Math.round(
    otherObjects.reduce((sum, o) => {
      const def = BUILDINGS_BY_ID[o.defId];
      if (!def || def.income <= 0) return sum;
      return sum + def.income * occupancyRate;
    }, 0) * priceMultiplier,
  );

  const income = pitchIncome + amenityIncome;

  const buildingUpkeep = Math.round(
    allObjects.reduce((sum, o) => sum + (BUILDINGS_BY_ID[o.defId]?.upkeep ?? 0), 0),
  );
  const staffWages = staff.reduce((sum, s) => sum + STAFF_DEFS[s.type].wage, 0);
  const upkeepTotal = buildingUpkeep + staffWages;

  const sanitaryCapacity = sanitaryCount * 10;
  const crowdingPenalty = occupiedCount > sanitaryCapacity ? (occupiedCount - sanitaryCapacity) * 0.6 : 0;
  const pricePenalty = Math.max(0, priceMultiplier - 1) * 6;

  const targetSatisfaction = clamp(
    35 +
      amenitySatisfaction * 1.4 +
      staffSatisfaction * 1.2 -
      crowdingPenalty -
      pricePenalty +
      externalSatisfactionDelta,
    0,
    100,
  );
  const newSatisfaction = satisfaction + (targetSatisfaction - satisfaction) * 0.15;

  return {
    objects: nextObjects,
    money: money + income - upkeepTotal,
    satisfaction: Math.round(newSatisfaction * 10) / 10,
    income,
    upkeepTotal,
    occupancyRate,
    newGuests,
    pitchCount: pitchObjects.length,
    occupiedCount,
    sanitaryCount,
    pitchIncome,
    amenityIncome,
    buildingUpkeep,
    staffWages,
    demand: clamp01(demand),
  };
}
