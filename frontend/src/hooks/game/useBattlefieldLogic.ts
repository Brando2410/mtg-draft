import { useMemo, useState } from 'react';
import { type GameObject, ActionType, type PlayerState } from '@shared/engine_types';

export const useBattlefieldLogic = (
  me: PlayerState | undefined,
  opponent: PlayerState | null | undefined,
  battlefield: GameObject[],
  pendingAction: any
) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const planningArrow = useMemo(() => {
    if ((pendingAction?.type === 'DECLARE_BLOCKERS' || pendingAction?.type === ActionType.DeclareBlockers) && pendingAction.sourceId) {
        const el = document.getElementById(`game-card-${pendingAction.sourceId}`);
        const bf = document.getElementById('battlefield-center')?.getBoundingClientRect();
        if (el && bf) {
            const r = el.getBoundingClientRect();
            return {
                sourceId: pendingAction.sourceId,
                x1: r.left + r.width/2 - bf.left,
                y1: r.top + r.height/2 - bf.top,
                x2: mousePos.x - bf.left,
                y2: mousePos.y - bf.top
            };
        }
    }
    return null;
  }, [pendingAction, mousePos]);

  const targetableIds = useMemo(() => {
    if (pendingAction?.playerId !== me?.id) return new Set<string>();
    if (pendingAction?.type === 'TARGETING' || pendingAction?.type === ActionType.Targeting) {
        const set = new Set<string>(pendingAction.data?.legalTargetIds || []);
        if (pendingAction.data?.legalPlayerIds) pendingAction.data.legalPlayerIds.forEach((id: string) => set.add(id));
        return set;
    }
    return new Set<string>();
  }, [pendingAction, me?.id]);

  const zones = useMemo(() => {
    const filter = (pid: string | undefined) => {
      const perms = battlefield.filter(o => o.controllerId === pid);
      return {
        creatures: perms.filter(o => o.definition.types.includes('Creature')),
        nonCreatures: perms.filter(o => !o.definition.types.includes('Creature') && !o.definition.types.includes('Land')),
        lands: perms.filter(o => o.definition.types.includes('Land')),
      };
    };
    return { me: filter(me?.id), opp: filter(opponent?.id) };
  }, [battlefield, me?.id, opponent?.id]);

  return { mousePos, setMousePos, planningArrow, targetableIds, zones };
};
