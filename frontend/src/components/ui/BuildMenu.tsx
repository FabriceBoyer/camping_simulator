import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../game/state/store';
import { BUILDINGS } from '../../game/data/buildings';
import { STAFF_LIST } from '../../game/data/staff';
import type { ObjectCategory, TerrainType } from '../../game/types';

type TabId = 'terrain' | ObjectCategory | 'staff';

const TABS: { id: TabId; icon: string; labelKey: string }[] = [
  { id: 'terrain', icon: '🌍', labelKey: 'categories.terrain' },
  { id: 'pitch', icon: '⛺', labelKey: 'categories.pitch' },
  { id: 'amenity', icon: '🚻', labelKey: 'categories.amenity' },
  { id: 'decoration', icon: '🌳', labelKey: 'categories.decoration' },
  { id: 'staff', icon: '🧑‍💼', labelKey: 'categories.staff' },
];

const TERRAIN_TOOLS: { terrain: TerrainType; icon: string; labelKey: string; cost: number }[] = [
  { terrain: 'grass', icon: '🌱', labelKey: 'tools.terrainGrass', cost: 0 },
  { terrain: 'sand', icon: '🏖️', labelKey: 'tools.terrainSand', cost: 4 },
  { terrain: 'road', icon: '🛣️', labelKey: 'tools.terrainRoad', cost: 8 },
];

export default function BuildMenu() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<TabId>('pitch');
  const [expanded, setExpanded] = useState(true);
  const tool = useGameStore((s) => s.tool);
  const setTool = useGameStore((s) => s.setTool);
  const money = useGameStore((s) => s.money);
  const staff = useGameStore((s) => s.staff);
  const hireStaff = useGameStore((s) => s.hireStaff);
  const fireStaff = useGameStore((s) => s.fireStaff);

  const isSelect = tool.kind === 'select';
  const isInfo = tool.kind === 'info';
  const isBulldoze = tool.kind === 'bulldoze';
  const isMove = tool.kind === 'move';

  return (
    <div className={`build-menu ${expanded ? 'expanded' : 'collapsed'}`}>
      <div className="build-menu-handle" onClick={() => setExpanded((v) => !v)}>
        <span className="build-menu-chevron">{expanded ? '▾' : '▴'}</span>
      </div>

      <div className="build-menu-modes">
        <button className={isSelect ? 'active' : ''} onClick={() => setTool({ kind: 'select' })}>
          🖐️ <span>{t('tools.select')}</span>
        </button>
        <button className={isInfo ? 'active' : ''} onClick={() => setTool({ kind: 'info' })}>
          ℹ️ <span>{t('tools.info')}</span>
        </button>
        <button className={isMove ? 'active' : ''} onClick={() => setTool({ kind: 'move' })}>
          ✋ <span>{t('tools.move')}</span>
        </button>
        <button className={isBulldoze ? 'active' : ''} onClick={() => setTool({ kind: 'bulldoze' })}>
          🧨 <span>{t('tools.bulldoze')}</span>
        </button>
      </div>

      <div className="build-menu-body">
        <div className="build-menu-tabs">
          {TABS.map((tb) => (
            <button
              key={tb.id}
              className={`build-tab ${tab === tb.id ? 'active' : ''}`}
              onClick={() => {
                setTab(tb.id);
                setExpanded(true);
              }}
            >
              <span className="build-tab-icon">{tb.icon}</span>
              <span className="build-tab-label">{t(tb.labelKey)}</span>
            </button>
          ))}
        </div>

        {expanded && (
          <div className="build-menu-items">
            {tab === 'terrain' &&
              TERRAIN_TOOLS.map((tt) => {
                const active = tool.kind === 'terrain' && tool.terrain === tt.terrain;
                return (
                  <button
                    key={tt.terrain}
                    className={`build-item ${active ? 'active' : ''}`}
                    onClick={() => setTool({ kind: 'terrain', terrain: tt.terrain })}
                  >
                    <span className="build-item-icon">{tt.icon}</span>
                    <span className="build-item-name">{t(tt.labelKey)}</span>
                    {tt.cost > 0 && <span className="build-item-cost">💰{tt.cost}</span>}
                  </button>
                );
              })}

            {(tab === 'pitch' || tab === 'amenity' || tab === 'decoration') &&
              BUILDINGS.filter((b) => b.category === tab).map((b) => {
                const active = tool.kind === 'build' && tool.defId === b.id;
                const affordable = money >= b.cost;
                return (
                  <button
                    key={b.id}
                    className={`build-item ${active ? 'active' : ''} ${!affordable ? 'unaffordable' : ''}`}
                    onClick={() => setTool({ kind: 'build', defId: b.id })}
                  >
                    <span className="build-item-icon">{b.icon}</span>
                    <span className="build-item-name">{t(b.nameKey)}</span>
                    <span className="build-item-cost">💰{b.cost}</span>
                  </button>
                );
              })}

            {tab === 'staff' && (
              <div className="staff-panel">
                <div className="staff-hire-row">
                  {STAFF_LIST.map((sd) => (
                    <button
                      key={sd.id}
                      className="build-item"
                      disabled={money < sd.wage * 5}
                      onClick={() => hireStaff(sd.id)}
                    >
                      <span className="build-item-icon">{sd.icon}</span>
                      <span className="build-item-name">{t(sd.nameKey)}</span>
                      <span className="build-item-cost">
                        💰{sd.wage}/{t('staff.wage').split('/')[1] ?? 'j'}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="staff-list">
                  {staff.length === 0 && <p className="staff-empty">{t('staff.noStaff')}</p>}
                  {staff.map((s) => (
                    <div key={s.id} className="staff-row">
                      <span>{t(`staff.${s.type}`)}</span>
                      <button className="staff-fire" onClick={() => fireStaff(s.id)}>
                        {t('staff.fire')}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
