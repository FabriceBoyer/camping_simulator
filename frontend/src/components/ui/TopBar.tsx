import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../game/state/store';
import { WEATHER_ICON } from '../../game/data/weather';
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
  onOpenLog: () => void;
}

export default function TopBar({ onOpenSaves, onOpenStats, onOpenLog }: Props) {
  const { t } = useTranslation();
  const money = useGameStore((s) => s.money);
  const day = useGameStore((s) => s.day);
  const year = useGameStore((s) => s.year);
  const season = useGameStore((s) => s.season);
  const satisfaction = useGameStore((s) => s.satisfaction);
  const weather = useGameStore((s) => s.weather);
  const undoCount = useGameStore((s) => s.undoStack.length);
  const redoCount = useGameStore((s) => s.redoStack.length);
  const undo = useGameStore((s) => s.undo);
  const redo = useGameStore((s) => s.redo);
  const moneyFlash = useChangeFlash(Math.round(money));

  return (
    <header className="topbar">
      <div className="topbar-brand">
        <span className="topbar-logo">🏕️</span>
        <span className="topbar-title">{t('app.title')}</span>
      </div>

      <div className="topbar-actions">
        <button
          className="topbar-icon-btn"
          onClick={undo}
          disabled={undoCount === 0}
          title={t('common.undo')}
        >
          ↩️
        </button>
        <button
          className="topbar-icon-btn"
          onClick={redo}
          disabled={redoCount === 0}
          title={t('common.redo')}
        >
          ↪️
        </button>
        <SpeedControls />
        <button className="topbar-icon-btn" onClick={onOpenStats} title={t('stats.title')}>
          📊
        </button>
        <button className="topbar-icon-btn" onClick={onOpenLog} title={t('log.title')}>
          📜
        </button>
        <button className="topbar-icon-btn" onClick={onOpenSaves} title={t('saveLoad.title')}>
          💾
        </button>
        <LanguageSwitcher />
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
        <div className="stat stat-hide-sm" title={t('topbar.weather')}>
          {WEATHER_ICON[weather]} {t(`weather.${weather}`)}
        </div>
        <div className="stat" title={t('season.' + season)}>
          {SEASON_ICON[season]} {t('topbar.day', { day })}
        </div>
        <div className="stat stat-hide-sm" title={t('topbar.year', { year })}>
          {t('topbar.year', { year })}
        </div>
      </div>
    </header>
  );
}
