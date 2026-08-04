import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../game/state/store';
import { BUILDINGS_BY_ID } from '../../game/data/buildings';
import { DISASTERS } from '../../game/data/events';
import Sparkline from './Sparkline';

interface Props {
  open: boolean;
  onClose: () => void;
}

const LOAN_MAX_DEBT = 6000;
const MARKETING_COST = 400;
const MARKETING_DURATION_DAYS = 5;

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
  const debt = useGameStore((s) => s.debt);
  const money = useGameStore((s) => s.money);
  const marketingDaysRemaining = useGameStore((s) => s.marketingDaysRemaining);
  const activeEvent = useGameStore((s) => s.activeEvent);
  const takeLoan = useGameStore((s) => s.takeLoan);
  const repayLoan = useGameStore((s) => s.repayLoan);
  const startMarketingCampaign = useGameStore((s) => s.startMarketingCampaign);
  const triggerDisaster = useGameStore((s) => s.triggerDisaster);

  const [loanAmount, setLoanAmount] = useState('1000');

  if (!open) return null;

  const pitchCount = Object.values(objects).filter(
    (o) => BUILDINGS_BY_ID[o.defId]?.category === 'pitch',
  ).length;
  const net = lastIncome - lastUpkeep;

  const moneySeries = history.map((h) => h.money);
  const satisfactionSeries = history.map((h) => h.satisfaction);
  const occupancySeries = history.map((h) => h.occupancyRate * 100);

  const parsedLoanAmount = Math.max(0, Math.round(parseFloat(loanAmount) || 0));

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

        <h3>🏦 {t('bank.title')}</h3>
        <div className="stats-row">
          <span>{t('bank.debt')}</span>
          <span className={debt > 0 ? 'stat-negative' : ''}>{debt} €</span>
        </div>
        <p className="pricing-hint">
          {t('bank.interestNote')} {t('bank.maxDebt', { max: LOAN_MAX_DEBT })}
        </p>
        <div className="bank-controls">
          <input
            type="number"
            min={0}
            step={100}
            value={loanAmount}
            onChange={(e) => setLoanAmount(e.target.value)}
            placeholder={t('bank.amountPlaceholder')}
          />
          <button
            className="primary-btn"
            disabled={parsedLoanAmount <= 0 || debt >= LOAN_MAX_DEBT}
            onClick={() => takeLoan(parsedLoanAmount)}
          >
            {t('bank.takeLoan')}
          </button>
          <button
            disabled={parsedLoanAmount <= 0 || debt <= 0 || money <= 0}
            onClick={() => repayLoan(parsedLoanAmount)}
          >
            {t('bank.repayLoan')}
          </button>
        </div>

        <h3>📣 {t('marketing.title')}</h3>
        <p className="pricing-hint">
          {t('marketing.hint', { cost: MARKETING_COST, days: MARKETING_DURATION_DAYS })}
        </p>
        <div className="stats-row">
          <span>
            {marketingDaysRemaining > 0
              ? t('marketing.active', { days: marketingDaysRemaining })
              : t('marketing.inactive')}
          </span>
          <button
            className="primary-btn"
            disabled={money < MARKETING_COST || marketingDaysRemaining > 0}
            onClick={startMarketingCampaign}
          >
            {t('marketing.start')}
          </button>
        </div>

        <h3>⚡ {t('events.title')}</h3>
        <p className="pricing-hint">{t('events.hint')}</p>
        {activeEvent && (
          <p className="stat-negative events-aftermath">
            {t('events.aftermath', { days: activeEvent.daysRemaining })}
          </p>
        )}
        <div className="events-grid">
          {DISASTERS.map((d) => (
            <div key={d.type} className="event-card">
              <div className="event-card-title">
                {d.icon} {t(d.nameKey)}
              </div>
              <p>{t(d.descriptionKey)}</p>
              <button className="danger-btn" onClick={() => triggerDisaster(d.type)}>
                {t('common.trigger')}
              </button>
            </div>
          ))}
        </div>

        <div className="modal-actions">
          <button onClick={onClose}>{t('common.close')}</button>
        </div>
      </div>
    </div>
  );
}
