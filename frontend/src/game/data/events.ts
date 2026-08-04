import type { DisasterType } from '../types';

export interface DisasterDef {
  type: DisasterType;
  icon: string;
  nameKey: string;
  descriptionKey: string;
  minDestroyed: number;
  maxDestroyed: number;
  satisfactionHit: number;
  moneyHit: number;
  durationDays: number;
  demandMultDuringAftermath: number;
}

export const DISASTERS: DisasterDef[] = [
  {
    type: 'fire',
    icon: '🔥',
    nameKey: 'events.fire',
    descriptionKey: 'events.fireDesc',
    minDestroyed: 1,
    maxDestroyed: 3,
    satisfactionHit: 25,
    moneyHit: 0,
    durationDays: 5,
    demandMultDuringAftermath: 0.6,
  },
  {
    type: 'tornado',
    icon: '🌪️',
    nameKey: 'events.tornado',
    descriptionKey: 'events.tornadoDesc',
    minDestroyed: 2,
    maxDestroyed: 5,
    satisfactionHit: 20,
    moneyHit: 200,
    durationDays: 4,
    demandMultDuringAftermath: 0.65,
  },
  {
    type: 'volcano',
    icon: '🌋',
    nameKey: 'events.volcano',
    descriptionKey: 'events.volcanoDesc',
    minDestroyed: 3,
    maxDestroyed: 6,
    satisfactionHit: 35,
    moneyHit: 1000,
    durationDays: 7,
    demandMultDuringAftermath: 0.45,
  },
];

export const DISASTERS_BY_TYPE: Record<DisasterType, DisasterDef> = Object.fromEntries(
  DISASTERS.map((d) => [d.type, d]),
) as Record<DisasterType, DisasterDef>;
