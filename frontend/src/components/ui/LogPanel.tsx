import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../game/state/store';
import { BUILDINGS_BY_ID } from '../../game/data/buildings';
import { STAFF_DEFS } from '../../game/data/staff';
import { DISASTERS_BY_TYPE } from '../../game/data/events';
import type { LogEntry } from '../../game/types';

interface Props {
  open: boolean;
  onClose: () => void;
}

const KIND_ICON: Record<LogEntry['kind'], string> = {
  build: '🏗️',
  demolish: '🗑️',
  move: '✋',
  hire: '🧑‍💼',
  fire: '👋',
  loan: '🏦',
  repay: '💳',
  marketing: '📣',
  disaster: '⚡',
  bankrupt: '💥',
};

function useLogMessage() {
  const { t } = useTranslation();
  return (entry: LogEntry): string => {
    switch (entry.kind) {
      case 'build':
        return t('log.built', { name: entry.defId ? t(BUILDINGS_BY_ID[entry.defId]?.nameKey ?? '') : '' });
      case 'demolish':
        return t('log.demolished', { name: entry.defId ? t(BUILDINGS_BY_ID[entry.defId]?.nameKey ?? '') : '' });
      case 'move':
        return t('log.moved', { name: entry.defId ? t(BUILDINGS_BY_ID[entry.defId]?.nameKey ?? '') : '' });
      case 'hire':
        return t('log.hired', { name: entry.staffType ? t(STAFF_DEFS[entry.staffType].nameKey) : '' });
      case 'fire':
        return t('log.fired', { name: entry.staffType ? t(STAFF_DEFS[entry.staffType].nameKey) : '' });
      case 'loan':
        return t('log.loanTaken', { amount: entry.amount ?? 0 });
      case 'repay':
        return t('log.loanRepaid', { amount: entry.amount ?? 0 });
      case 'marketing':
        return t('log.marketingStarted', { amount: entry.amount ?? 0 });
      case 'disaster':
        return t('log.disaster', {
          name: entry.disasterType ? t(DISASTERS_BY_TYPE[entry.disasterType].nameKey) : '',
        });
      case 'bankrupt':
        return t('log.bankrupt');
      default:
        return '';
    }
  };
}

export default function LogPanel({ open, onClose }: Props) {
  const { t } = useTranslation();
  const logs = useGameStore((s) => s.logs);
  const formatMessage = useLogMessage();

  if (!open) return null;

  const sorted = [...logs].reverse();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-card-wide" onClick={(e) => e.stopPropagation()}>
        <h2>📜 {t('log.title')}</h2>
        {sorted.length === 0 ? (
          <p className="save-empty">{t('log.empty')}</p>
        ) : (
          <ul className="log-list">
            {sorted.map((entry) => (
              <li key={entry.id} className={`log-row log-row-${entry.kind}`}>
                <span className="log-icon">{KIND_ICON[entry.kind]}</span>
                <div className="log-body">
                  <div className="log-message">{formatMessage(entry)}</div>
                  <div className="log-date">{t('log.dayYear', { day: entry.day, year: entry.year })}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="modal-actions">
          <button onClick={onClose}>{t('common.close')}</button>
        </div>
      </div>
    </div>
  );
}
