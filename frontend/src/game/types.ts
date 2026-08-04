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
  | { kind: 'bulldoze' }
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
