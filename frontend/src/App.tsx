import { useEffect, useState } from 'react';
import './App.css';
import { useGameStore } from './game/state/store';
import GameCanvas from './components/GameCanvas';
import TopBar from './components/ui/TopBar';
import BuildMenu from './components/ui/BuildMenu';
import GameOverModal from './components/ui/GameOverModal';
import Toast from './components/ui/Toast';
import SaveLoadPanel from './components/ui/SaveLoadPanel';

const SPEED_INTERVAL_MS: Record<number, number> = {
  1: 3500,
  2: 1800,
  4: 800,
};

function App() {
  const speed = useGameStore((s) => s.speed);
  const tick = useGameStore((s) => s.tick);
  const [savesOpen, setSavesOpen] = useState(false);

  useEffect(() => {
    if (speed === 0) return;
    const ms = SPEED_INTERVAL_MS[speed] ?? 3500;
    const id = window.setInterval(() => tick(), ms);
    return () => window.clearInterval(id);
  }, [speed, tick]);

  return (
    <div className="app-shell">
      <TopBar onOpenSaves={() => setSavesOpen(true)} />
      <main className="app-main">
        <GameCanvas />
      </main>
      <BuildMenu />
      <GameOverModal />
      <Toast />
      <SaveLoadPanel open={savesOpen} onClose={() => setSavesOpen(false)} />
    </div>
  );
}

export default App;
