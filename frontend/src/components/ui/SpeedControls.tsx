import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../game/state/store';

const SPEEDS: { value: 0 | 1 | 2 | 4; icon: string; labelKey: string }[] = [
  { value: 0, icon: '⏸', labelKey: 'speed.pause' },
  { value: 1, icon: '▶', labelKey: 'speed.normal' },
  { value: 2, icon: '⏩', labelKey: 'speed.fast' },
  { value: 4, icon: '⏩⏩', labelKey: 'speed.veryFast' },
];

export default function SpeedControls() {
  const { t } = useTranslation();
  const speed = useGameStore((s) => s.speed);
  const setSpeed = useGameStore((s) => s.setSpeed);
  const gameOver = useGameStore((s) => s.gameOver);

  return (
    <div className="speed-controls" role="group" aria-label="Speed">
      {SPEEDS.map((s) => (
        <button
          key={s.value}
          className={`speed-btn ${speed === s.value ? 'active' : ''}`}
          title={t(s.labelKey)}
          disabled={gameOver}
          onClick={() => setSpeed(s.value)}
        >
          {s.icon}
        </button>
      ))}
    </div>
  );
}
