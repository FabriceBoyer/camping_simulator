import type { SerializedGame } from '../game/state/store';

const STORAGE_KEY = 'camping-simulator-saves';

export interface LocalSave {
  id: string;
  name: string;
  updatedAt: string;
  state: SerializedGame;
}

function readAll(): LocalSave[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LocalSave[];
  } catch {
    return [];
  }
}

function writeAll(saves: LocalSave[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
}

export function listLocalSaves(): LocalSave[] {
  return readAll().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function saveLocal(name: string, state: SerializedGame): LocalSave {
  const saves = readAll();
  const entry: LocalSave = {
    id: Math.random().toString(36).slice(2, 10),
    name,
    updatedAt: new Date().toISOString(),
    state,
  };
  writeAll([...saves, entry]);
  return entry;
}

export function deleteLocalSave(id: string) {
  writeAll(readAll().filter((s) => s.id !== id));
}
