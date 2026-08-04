import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../game/state/store';
import SpeedControls from './SpeedControls';
import LanguageSwitcher from './LanguageSwitcher';

const SEASON_ICON: Record<string, string> = {
  spring: '🌱',
  summer: '☀️',
  autumn: '🍂',
  winter: '❄️',
};

function satisfactionFace(v: number) {
  if (v >= 75) return '😄';
  if (v >= 50) return '🙂';
  if (v >= 25) return '😐';
  return '😞';
}

/** Briefly flashes green/red when a numeric value changes, for a bit of
 * "alive" feedback on the money counter. */
function useChangeFlash(value: number): 'up' | 'down' | null {
  const prevRef = useRef(value);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    const prev = prevRef.current;
    if (value !== prev) {
      setFlash(value > prev ? 'up' : 'down');
      prevRef.current = value;
      const id = window.setTimeout(() => setFlash(null), 650);
      return () => window.clearTimeout(id);
    }
  }, [value]);

  return flash;
}

interface Props {
  onOpenSaves: () => void;
  onOpenStats: () => void;
}

export default function TopBar({ onOpenSaves, onOpenStats }: Props) {
  const { t } = useTranslation();
  const money = useGameStore((s) => s.money);
  const day = useGameStore((s) => s.day);
  const year = useGameStore((s) => s.year);
  const season = useGameStore((s) => s.season);
  const satisfaction = useGameStore((s) => s.satisfaction);
  const moneyFlash = useChangeFlash(Math.round(money));

  return (
    <header className="topbar">
      <div className="topbar-brand">
        <span className="topbar-logo">🏕️</span>
        <span className="topbar-title">{t('app.title')}</span>
      </div>

      <div className="topbar-stats">
        <div
          className={`stat ${money < 0 ? 'stat-negative' : ''} ${moneyFlash ? `stat-flash-${moneyFlash}` : ''}`}
          title={t('topbar.money')}
        >
          💰 {Math.round(money).toLocaleString()} €
        </div>
        <div className="stat" title={t('topbar.satisfaction')}>
          {satisfactionFace(satisfaction)} {Math.round(satisfaction)}%
        </div>
        <div className="stat" title={t('season.' + season)}>
          {SEASON_ICON[season]} {t('topbar.day', { day })}
        </div>
        <div className="stat stat-hide-sm" title={t('topbar.year', { year })}>
          {t('topbar.year', { year })}
        </div>
      </div>

      <div className="topbar-actions">
        <SpeedControls />
        <button className="topbar-icon-btn" onClick={onOpenStats} title={t('stats.title')}>
          📊
        </button>
        <button className="topbar-icon-btn" onClick={onOpenSaves} title={t('saveLoad.title')}>
          💾
        </button>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
