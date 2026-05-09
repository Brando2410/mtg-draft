import { useMemo, useCallback } from 'react';
import { type StackObject, type PlayerState, type GameObject } from '@shared/engine_types';

export const useStackLogic = (
  stack: StackObject[],
  pendingAction: any,
  me: PlayerState | undefined,
  opponent: PlayerState | null | undefined,
  battlefield: GameObject[],
  exile?: GameObject[]
) => {
  const findObject = useCallback((id: string): GameObject | undefined => {
    if (!id) return undefined;
    
    const inBf = battlefield.find(o => o.id === id);
    if (inBf) return inBf;

    const inExile = (exile || []).find(o => o.id === id);
    if (inExile) return inExile;

    const inMyGrave = me?.graveyard.find(o => o.id === id);
    if (inMyGrave) return inMyGrave;

    const inOppGrave = opponent?.graveyard.find(o => o.id === id);
    if (inOppGrave) return inOppGrave;

    const inStack = stack.find(s => s.id === id);
    if (inStack) {
        return (inStack.sourceObject || { 
            id: inStack.id, 
            definition: inStack.definition || { name: inStack.name || 'Ability', image_url: '/back.png', types: [], colors: [], manaCost: '', oracleText: '' },
            counters: {}, keywords: [], zone: 'Stack' 
        }) as GameObject;
    }

    if (me?.id === id) {
      return {
        id: me.id,
        definition: { name: me.name, image_url: me.avatar || '/avatars/default.png', types: ['Player'], colors: [], manaCost: '', oracleText: 'Player' },
        counters: { life: me.life }, keywords: [], zone: 'Battlefield'
      } as any;
    }
    if (opponent?.id === id) {
      return {
        id: opponent.id,
        definition: { name: opponent.name, image_url: opponent.avatar || '/avatars/default.png', types: ['Player'], colors: [], manaCost: '', oracleText: 'Player' },
        counters: { life: opponent.life }, keywords: [], zone: 'Battlefield'
      } as any;
    }

    return undefined;
  }, [battlefield, exile, me, opponent, stack]);

  const effectiveStack = useMemo(() => {
    const filteredStack = stack.filter(s => s.sourceId || s.name || s.sourceObject || s.definition);
    const result = [...filteredStack];

    if (pendingAction?.data?.metadata?.stackObj || pendingAction?.data?.stackObj) {
      const pObj = pendingAction?.data?.metadata?.stackObj || pendingAction?.data?.stackObj;
      if (pObj.sourceId || pObj.name || pObj.sourceObject || pObj.definition) {
        const isAlreadyOnStack = filteredStack.some(s => 
          s.id === pObj.id || 
          (s.sourceId && s.sourceId === pObj.sourceId && s.type === pObj.type)
        );
        if (!isAlreadyOnStack) {
            result.push(pObj);
        }
      }
    }
    return result;
  }, [stack, pendingAction]);

  const getDisplayObj = useCallback((sobj: StackObject) => {
    return sobj.sourceObject || 
           (sobj.definition ? { id: sobj.id, definition: sobj.definition, counters: {}, keywords: [], zone: 'Stack' } : null) || 
           findObject(sobj.sourceId) || 
           {
              id: sobj.id,
              definition: {
                  name: sobj.name || 'Ability',
                  image_url: sobj.image_url || '/back.png',
                  types: [],
                  colors: [],
                  manaCost: '',
                  oracleText: ''
              },
              counters: {},
              keywords: [],
              zone: 'Stack'
          };
  }, [findObject]);

  return { effectiveStack, findObject, getDisplayObj };
};
