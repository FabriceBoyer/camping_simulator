import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../game/state/store';

export default function GameOverModal() {
  const { t } = useTranslation();
  const gameOver = useGameStore((s) => s.gameOver);
  const resetGame = useGameStore((s) => s.resetGame);

  if (!gameOver) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2>🏚️ {t('gameOver.title')}</h2>
        <p>{t('gameOver.message')}</p>
        <button className="primary-btn" onClick={resetGame}>
          {t('gameOver.restart')}
        </button>
      </div>
    </div>
  );
}
