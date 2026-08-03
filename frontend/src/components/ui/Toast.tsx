import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../game/state/store';

export default function Toast() {
  const { t } = useTranslation();
  const toast = useGameStore((s) => s.toast);
  const dismissToast = useGameStore((s) => s.dismissToast);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => dismissToast(), 2200);
    return () => clearTimeout(id);
  }, [toast, dismissToast]);

  if (!toast) return null;

  return (
    <div className="toast" onClick={dismissToast}>
      {t(toast)}
    </div>
  );
}
