export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export type TerrainType = 'grass' | 'road' | 'sand' | 'water';

export type ObjectCategory = 'pitch' | 'amenity' | 'decoration';

export interface BuildingDef {
  id: string;
  category: ObjectCategory;
  nameKey: string;
  cost: number;
  upkeep: number;
  income: number;
  satisfaction: number;
  w: number;
  h: number;
  icon: string;
  color: string;
  minSeasonToOperate?: Season;
}

export interface PlacedObject {
  id: string;
  defId: string;
  x: number;
  y: number;
  occupied: boolean;
  occupiedUntilDay: number;
}

export type StaffType = 'groundskeeper' | 'receptionist' | 'lifeguard';

export interface StaffDef {
  id: StaffType;
  nameKey: string;
  wage: number;
  satisfaction: number;
  icon: string;
}

export interface StaffMember {
  id: string;
  type: StaffType;
}

export type ToolMode =
  | { kind: 'select' }
  | { kind: 'info' }
  | { kind: 'bulldoze' }
  | { kind: 'move' }
  | { kind: 'terrain'; terrain: TerrainType }
  | { kind: 'build'; defId: string };

export interface HistoryPoint {
  day: number;
  money: number;
  satisfaction: number;
  occupancyRate: number;
  income: number;
  upkeep: number;
}

export interface Camera {
  x: number;
  y: number;
  zoom: number;
}

export type Weather = 'sunny' | 'cloudy' | 'rain' | 'storm';

export type DisasterType = 'fire' | 'tornado' | 'volcano';

export interface ActiveEvent {
  type: DisasterType;
  daysRemaining: number;
  /** Epicenter, for the on-map visual effect (average of destroyed
   * buildings, or a random spot if none were hit). */
  x: number;
  y: number;
}

export type LogKind =
  | 'build'
  | 'demolish'
  | 'move'
  | 'hire'
  | 'fire'
  | 'loan'
  | 'repay'
  | 'marketing'
  | 'disaster'
  | 'bankrupt';

export interface LogEntry {
  id: string;
  day: number;
  year: number;
  kind: LogKind;
  defId?: string;
  staffType?: StaffType;
  amount?: number;
  disasterType?: DisasterType;
}
