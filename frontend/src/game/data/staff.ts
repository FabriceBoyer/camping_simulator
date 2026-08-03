import type { StaffDef, StaffType } from '../types';

export const STAFF_DEFS: Record<StaffType, StaffDef> = {
  groundskeeper: {
    id: 'groundskeeper',
    nameKey: 'staff.groundskeeper',
    wage: 18,
    satisfaction: 4,
    icon: '🧹',
  },
  receptionist: {
    id: 'receptionist',
    nameKey: 'staff.receptionist',
    wage: 20,
    satisfaction: 5,
    icon: '🧑‍💼',
  },
  lifeguard: {
    id: 'lifeguard',
    nameKey: 'staff.lifeguard',
    wage: 22,
    satisfaction: 3,
    icon: '🏊‍♂️',
  },
};

export const STAFF_LIST: StaffDef[] = Object.values(STAFF_DEFS);
