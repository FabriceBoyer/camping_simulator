import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../game/state/store';
import { BUILDINGS_BY_ID } from '../../game/data/buildings';
import Sparkline from './Sparkline';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function StatsPanel({ open, onClose }: Props) {
  const { t } = useTranslation();
  const history = useGameStore((s) => s.history);
  const priceMultiplier = useGameStore((s) => s.priceMultiplier);
  const setPriceMultiplier = useGameStore((s) => s.setPriceMultiplier);
  const lastPitchIncome = useGameStore((s) => s.lastPitchIncome);
  const lastAmenityIncome = useGameStore((s) => s.lastAmenityIncome);
  const lastBuildingUpkeep = useGameStore((s) => s.lastBuildingUpkeep);
  const lastStaffWages = useGameStore((s) => s.lastStaffWages);
  const lastIncome = useGameStore((s) => s.lastIncome);
  const lastUpkeep = useGameStore((s) => s.lastUpkeep);
  const lastOccupiedCount = useGameStore((s) => s.lastOccupiedCount);
  const lastDemand = useGameStore((s) => s.lastDemand);
  const lastNewGuests = useGameStore((s) => s.lastNewGuests);
  const objects = useGameStore((s) => s.objects);

  if (!open) return null;

  const pitchCount = Object.values(objects).filter(
    (o) => BUILDINGS_BY_ID[o.defId]?.category === 'pitch',
  ).length;
  const net = lastIncome - lastUpkeep;

  const moneySeries = history.map((h) => h.money);
  const satisfactionSeries = history.map((h) => h.satisfaction);
  const occupancySeries = history.map((h) => h.occupancyRate * 100);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-card-wide" onClick={(e) => e.stopPropagation()}>
        <h2>📊 {t('stats.title')}</h2>

        <div className="stats-charts">
          <div className="stats-chart-block">
            <div className="stats-chart-label">
              <span>💰 {t('stats.moneyHistory')}</span>
              <span className={net < 0 ? 'stat-negative' : ''}>
                {net >= 0 ? '+' : ''}
                {net} €/{t('stats.day')}
              </span>
            </div>
            <Sparkline data={moneySeries} color="#3a7d44" />
          </div>
          <div className="stats-chart-block">
            <div className="stats-chart-label">
              <span>🙂 {t('stats.satisfactionHistory')}</span>
              <span>{satisfactionSeries.at(-1)?.toFixed(0) ?? 0}%</span>
            </div>
            <Sparkline data={satisfactionSeries} color="#e07a5f" />
          </div>
          <div className="stats-chart-block">
            <div className="stats-chart-label">
              <span>⛺ {t('stats.occupancyHistory')}</span>
              <span>{occupancySeries.at(-1)?.toFixed(0) ?? 0}%</span>
            </div>
            <Sparkline data={occupancySeries} color="#457b9d" />
          </div>
        </div>

        <h3>{t('stats.todayBreakdown')}</h3>
        <div className="stats-breakdown">
          <div className="stats-row">
            <span>{t('stats.pitchIncome')}</span>
            <span>+{lastPitchIncome} €</span>
          </div>
          <div className="stats-row">
            <span>{t('stats.amenityIncome')}</span>
            <span>+{lastAmenityIncome} €</span>
          </div>
          <div className="stats-row">
            <span>{t('stats.buildingUpkeep')}</span>
            <span>-{lastBuildingUpkeep} €</span>
          </div>
          <div className="stats-row">
            <span>{t('stats.staffWages')}</span>
            <span>-{lastStaffWages} €</span>
          </div>
          <div className="stats-row stats-row-total">
            <span>{t('stats.netToday')}</span>
            <span className={net < 0 ? 'stat-negative' : ''}>
              {net >= 0 ? '+' : ''}
              {net} €
            </span>
          </div>
          <div className="stats-row">
            <span>{t('stats.occupiedPitches')}</span>
            <span>
              {lastOccupiedCount} / {pitchCount}
            </span>
          </div>
          <div className="stats-row">
            <span>{t('stats.demand')}</span>
            <span>{Math.round(lastDemand * 100)}%</span>
          </div>
          <div className="stats-row">
            <span>{t('stats.newGuestsToday')}</span>
            <span>{lastNewGuests}</span>
          </div>
        </div>

        <h3>{t('stats.pricing')}</h3>
        <div className="pricing-control">
          <input
            type="range"
            min={0.5}
            max={2}
            step={0.05}
            value={priceMultiplier}
            onChange={(e) => setPriceMultiplier(parseFloat(e.target.value))}
          />
          <div className="pricing-value">{Math.round(priceMultiplier * 100)}%</div>
        </div>
        <p className="pricing-hint">{t('stats.pricingHint')}</p>

        <div className="modal-actions">
          <button onClick={onClose}>{t('common.close')}</button>
        </div>
      </div>
    </div>
  );
}
