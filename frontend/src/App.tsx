import { useEffect, useState } from 'react';
import './App.css';
import { useGameStore } from './game/state/store';
import GameCanvas from './components/GameCanvas';
import TopBar from './components/ui/TopBar';
import BuildMenu from './components/ui/BuildMenu';
import GameOverModal from './components/ui/GameOverModal';
import Toast from './components/ui/Toast';
import SaveLoadPanel from './components/ui/SaveLoadPanel';
import StatsPanel from './components/ui/StatsPanel';

const SPEED_INTERVAL_MS: Record<number, number> = {
  1: 3500,
  2: 1800,
  4: 800,
};

function App() {
  const speed = useGameStore((s) => s.speed);
  const tick = useGameStore((s) => s.tick);
  const [savesOpen, setSavesOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);

  useEffect(() => {
    if (speed === 0) return;
    const ms = SPEED_INTERVAL_MS[speed] ?? 3500;
    const id = window.setInterval(() => tick(), ms);
    return () => window.clearInterval(id);
  }, [speed, tick]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      const key = e.key.toLowerCase();
      if (key === 'z' && !e.shiftKey) {
        e.preventDefault();
        useGameStore.getState().undo();
      } else if ((key === 'z' && e.shiftKey) || key === 'y') {
        e.preventDefault();
        useGameStore.getState().redo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="app-shell">
      <TopBar onOpenSaves={() => setSavesOpen(true)} onOpenStats={() => setStatsOpen(true)} />
      <main className="app-main">
        <GameCanvas />
      </main>
      <BuildMenu />
      <GameOverModal />
      <Toast />
      <SaveLoadPanel open={savesOpen} onClose={() => setSavesOpen(false)} />
      <StatsPanel open={statsOpen} onClose={() => setStatsOpen(false)} />
    </div>
  );
}

export default App;
