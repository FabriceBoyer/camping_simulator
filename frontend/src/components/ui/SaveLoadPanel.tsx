import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../game/state/store';
import { listLocalSaves, saveLocal, deleteLocalSave, type LocalSave } from '../../api/localSaves';

interface Props {
  open: boolean;
  onClose: () => void;
}

function formatDate(iso: string, locale: string) {
  try {
    return new Date(iso).toLocaleString(locale, { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

export default function SaveLoadPanel({ open, onClose }: Props) {
  const { t, i18n } = useTranslation();
  const serialize = useGameStore((s) => s.serialize);
  const loadFromSave = useGameStore((s) => s.loadFromSave);
  const resetGame = useGameStore((s) => s.resetGame);

  const [name, setName] = useState('');
  const [localList, setLocalList] = useState<LocalSave[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const refreshLocal = () => setLocalList(listLocalSaves());

  useEffect(() => {
    if (!open) return;
    refreshLocal();
    setMessage(null);
  }, [open]);

  if (!open) return null;

  const effectiveName = name.trim() || 'Camping';

  const handleSave = () => {
    saveLocal(effectiveName, serialize());
    refreshLocal();
    setMessage(t('saveLoad.saved'));
  };

  const handleLoad = (s: LocalSave) => {
    loadFromSave(s.state);
    setMessage(t('saveLoad.loaded'));
    onClose();
  };

  const handleDelete = (id: string) => {
    if (!window.confirm(t('saveLoad.confirmDelete'))) return;
    deleteLocalSave(id);
    refreshLocal();
  };

  const handleNewGame = () => {
    if (!window.confirm(t('saveLoad.confirmNew'))) return;
    resetGame();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-card-wide" onClick={(e) => e.stopPropagation()}>
        <h2>💾 {t('saveLoad.title')}</h2>
        <p className="save-hint">{t('saveLoad.autosaveHint')}</p>

        <div className="save-name-row">
          <input
            type="text"
            placeholder={t('saveLoad.namePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
          />
          <button className="primary-btn" onClick={handleSave}>
            {t('common.save')}
          </button>
        </div>

        {message && <p className="save-message">{message}</p>}

        <section className="save-section">
          <h3>{t('saveLoad.localSaves')}</h3>
          {localList.length === 0 && <p className="save-empty">{t('saveLoad.empty')}</p>}
          <ul className="save-list">
            {localList.map((s) => (
              <li key={s.id}>
                <div className="save-item-info">
                  <strong>{s.name}</strong>
                  <span>{formatDate(s.updatedAt, i18n.language)}</span>
                </div>
                <div className="save-item-actions">
                  <button onClick={() => handleLoad(s)}>{t('common.load')}</button>
                  <button className="danger" onClick={() => handleDelete(s.id)}>
                    {t('common.delete')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div className="modal-actions">
          <button className="danger-btn" onClick={handleNewGame}>
            🆕 {t('common.new')}
          </button>
          <button onClick={onClose}>{t('common.close')}</button>
        </div>
      </div>
    </div>
  );
}
