import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../game/state/store';
import type { SerializedGame } from '../../game/state/store';
import { listLocalSaves, saveLocal, deleteLocalSave, type LocalSave } from '../../api/localSaves';
import { listCloudSaves, createCloudSave, getCloudSave, deleteCloudSave, type SaveMeta } from '../../api/client';

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
  const [cloudList, setCloudList] = useState<SaveMeta[] | null>(null);
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const refreshLocal = () => setLocalList(listLocalSaves());

  const refreshCloud = () => {
    setCloudError(null);
    listCloudSaves()
      .then(setCloudList)
      .catch(() => {
        setCloudList(null);
        setCloudError(t('saveLoad.serverError'));
      });
  };

  useEffect(() => {
    if (!open) return;
    refreshLocal();
    refreshCloud();
    setMessage(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const effectiveName = name.trim() || 'Camping';

  const handleSaveLocal = () => {
    saveLocal(effectiveName, serialize());
    refreshLocal();
    setMessage(t('saveLoad.saved'));
  };

  const handleSaveCloud = async () => {
    try {
      await createCloudSave(effectiveName, serialize());
      refreshCloud();
      setMessage(t('saveLoad.saved'));
    } catch {
      setCloudError(t('saveLoad.serverError'));
    }
  };

  const handleLoadLocal = (s: LocalSave) => {
    loadFromSave(s.state);
    setMessage(t('saveLoad.loaded'));
    onClose();
  };

  const handleLoadCloud = async (id: string) => {
    try {
      const rec = await getCloudSave(id);
      loadFromSave(rec.state as SerializedGame);
      setMessage(t('saveLoad.loaded'));
      onClose();
    } catch {
      setCloudError(t('saveLoad.serverError'));
    }
  };

  const handleDeleteLocal = (id: string) => {
    if (!window.confirm(t('saveLoad.confirmDelete'))) return;
    deleteLocalSave(id);
    refreshLocal();
  };

  const handleDeleteCloud = async (id: string) => {
    if (!window.confirm(t('saveLoad.confirmDelete'))) return;
    try {
      await deleteCloudSave(id);
      refreshCloud();
    } catch {
      setCloudError(t('saveLoad.serverError'));
    }
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

        <div className="save-name-row">
          <input
            type="text"
            placeholder={t('saveLoad.namePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
          />
          <button className="primary-btn" onClick={handleSaveLocal}>
            {t('common.save')} 📱
          </button>
          <button className="primary-btn" onClick={handleSaveCloud}>
            {t('common.save')} ☁️
          </button>
        </div>

        {message && <p className="save-message">{message}</p>}

        <div className="save-columns">
          <section>
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
                    <button onClick={() => handleLoadLocal(s)}>{t('common.load')}</button>
                    <button className="danger" onClick={() => handleDeleteLocal(s.id)}>
                      {t('common.delete')}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3>{t('saveLoad.cloudSaves')}</h3>
            {cloudError && <p className="save-error">{cloudError}</p>}
            {!cloudError && cloudList && cloudList.length === 0 && (
              <p className="save-empty">{t('saveLoad.empty')}</p>
            )}
            {!cloudError && cloudList === null && <p className="save-empty">{t('common.loading')}</p>}
            <ul className="save-list">
              {cloudList?.map((s) => (
                <li key={s.id}>
                  <div className="save-item-info">
                    <strong>{s.name}</strong>
                    <span>{formatDate(s.updatedAt, i18n.language)}</span>
                  </div>
                  <div className="save-item-actions">
                    <button onClick={() => handleLoadCloud(s.id)}>{t('common.load')}</button>
                    <button className="danger" onClick={() => handleDeleteCloud(s.id)}>
                      {t('common.delete')}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

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
