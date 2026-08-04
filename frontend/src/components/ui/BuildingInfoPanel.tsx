import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../game/state/store';
import { BUILDINGS_BY_ID } from '../../game/data/buildings';
import { vibrate } from '../../game/engine/haptics';

interface Props {
  objectId: string;
  sx: number;
  sy: number;
  onClose: () => void;
}

export default function BuildingInfoPanel({ objectId, sx, sy, onClose }: Props) {
  const { t } = useTranslation();
  const obj = useGameStore((s) => s.objects[objectId]);
  const demolishObject = useGameStore((s) => s.demolishObject);
  const setTool = useGameStore((s) => s.setTool);

  if (!obj) return null;
  const def = BUILDINGS_BY_ID[obj.defId];
  if (!def) return null;

  return (
    <div className="info-chip info-chip-rich" style={{ left: sx, top: sy }}>
      <div className="info-chip-title">
        <span>{def.icon}</span> {t(def.nameKey)}
      </div>
      <div className="info-chip-body">
        <div className="info-chip-row">
          <span>{t('buildingInfo.category')}</span>
          <span>{t(`categories.${def.category}`)}</span>
        </div>
        <div className="info-chip-row">
          <span>{t('buildingInfo.cost')}</span>
          <span>{def.cost} €</span>
        </div>
        {def.income > 0 && (
          <div className="info-chip-row">
            <span>{t('buildingInfo.income')}</span>
            <span>+{def.income} €</span>
          </div>
        )}
        {def.upkeep > 0 && (
          <div className="info-chip-row">
            <span>{t('buildingInfo.upkeep')}</span>
            <span>-{def.upkeep} €</span>
          </div>
        )}
        {def.satisfaction > 0 && (
          <div className="info-chip-row">
            <span>{t('buildingInfo.satisfaction')}</span>
            <span>+{def.satisfaction}</span>
          </div>
        )}
        {def.category === 'pitch' && (
          <div className="info-chip-row">
            <span>{t('buildingInfo.status')}</span>
            <span>
              {obj.occupied ? t('buildingInfo.occupied', { day: obj.occupiedUntilDay }) : t('buildingInfo.vacant')}
            </span>
          </div>
        )}
      </div>
      <div className="info-chip-actions">
        <button
          className="info-chip-move"
          onClick={() => {
            setTool({ kind: 'move' });
            onClose();
          }}
        >
          ✋ {t('tools.move')}
        </button>
        <button
          className="info-chip-demolish"
          onClick={() => {
            demolishObject(objectId);
            vibrate(10);
            onClose();
          }}
        >
          🗑️ {t('common.demolish')}
        </button>
      </div>
    </div>
  );
}
