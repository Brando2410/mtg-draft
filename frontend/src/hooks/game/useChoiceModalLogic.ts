import { useState, useEffect, useMemo, useCallback } from 'react';
import { ActionType, type GameObject, type PlayerState, type StackObject } from '@shared/engine_types';

export const useChoiceModalLogic = (
    pendingAction: any,
    me: PlayerState | undefined,
    opponent: PlayerState | null | undefined,
    battlefield: GameObject[],
    stack: StackObject[],
    exile: any[],
    onTapCard: (id: string) => void
) => {
    const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
    const [minimized, setMinimized] = useState(false);
    const [orderedTriggers, setOrderedTriggers] = useState<any[]>([]);
    const [scryState, setScryState] = useState<{ top: any[], bottom: any[], graveyard: any[] }>({ top: [], bottom: [], graveyard: [] });
    const [viewedPlayerId, setViewedPlayerId] = useState<string | null>(null);

    useEffect(() => {
        setSelectedIndices([]);
        setOrderedTriggers([]);
        setScryState({ top: [], bottom: [], graveyard: [] });
        setViewedPlayerId(me?.id || null);
    }, [pendingAction?.type, pendingAction?.sourceId, pendingAction?.data?.label, me?.id]);

    const sourceObject = useMemo(() => {
        const sourceId = pendingAction?.sourceId;
        if (!sourceId) return null;
        let obj = battlefield.find(c => c.id === sourceId);
        if (obj) return obj;
        const stackObj = stack.find(s => s.id === sourceId || s.sourceId === sourceId);
        if (stackObj) {
            return {
                id: stackObj.id,
                definition: stackObj.definition || (stackObj as any).cardData?.definition
            } as GameObject;
        }
        obj = (me?.graveyard as any[])?.find(c => c.id === sourceId);
        if (obj) return obj;
        obj = (opponent?.graveyard as any[])?.find(c => c.id === sourceId);
        if (obj) return obj;
        obj = exile.find(c => c.id === sourceId);
        if (obj) return obj;
        obj = (me?.hand as any[])?.find(c => c.id === sourceId);
        if (obj) return obj;
        return null;
    }, [pendingAction?.sourceId, battlefield, stack, me, opponent, exile]);

    const isOrderTriggers = pendingAction?.type === ActionType.OrderTriggers;
    const isScrySurveil = pendingAction?.type === ActionType.Scry || pendingAction?.type === ActionType.Surveil;
    
    const choices = pendingAction?.data?.choices || [];
    const minChoices = pendingAction?.data?.minChoices || 1;
    const maxChoices = pendingAction?.data?.maxChoices || 1;
    const allowDuplicates = pendingAction?.data?.allowDuplicates;

    useEffect(() => {
        if (isOrderTriggers && pendingAction?.data?.triggers) {
            setOrderedTriggers(pendingAction.data.triggers);
        }
        if (isScrySurveil && pendingAction?.data?.lookingCards) {
            setScryState({
                top: [...pendingAction.data.lookingCards],
                bottom: [],
                graveyard: []
            });
        }
    }, [pendingAction?.data?.triggers, pendingAction?.data?.lookingCards, isOrderTriggers, isScrySurveil]);

    const handleChoiceClick = useCallback((originalIdx: number) => {
        const choice = choices[originalIdx];
        if (!choice || choice.selectable === false) return;

        if (maxChoices === 1) {
            if (choice.cardData) {
                setSelectedIndices(prev => prev.includes(originalIdx) ? [] : [originalIdx]);
            } else {
                onTapCard?.(`CHOICE_${originalIdx}`);
            }
        } else {
            if (allowDuplicates) {
                if (selectedIndices.length < maxChoices) {
                    setSelectedIndices(prev => [...prev, originalIdx]);
                }
            } else {
                setSelectedIndices(prev => prev.includes(originalIdx) ? prev.filter(i => i !== originalIdx) : (prev.length < maxChoices ? [...prev, originalIdx] : prev));
            }
        }
    }, [choices, maxChoices, allowDuplicates, selectedIndices.length, onTapCard]);

    const handleChoiceRightClick = useCallback((e: React.MouseEvent, originalIdx: number) => {
        e.preventDefault();
        if (!allowDuplicates) return;

        const firstMatch = selectedIndices.indexOf(originalIdx);
        if (firstMatch !== -1) {
            setSelectedIndices(prev => {
                const next = [...prev];
                next.splice(firstMatch, 1);
                return next;
            });
        }
    }, [allowDuplicates, selectedIndices]);

    const moveCard = useCallback((card: any, from: 'top' | 'bottom' | 'graveyard', to: 'top' | 'bottom' | 'graveyard') => {
        setScryState(prev => {
            const newFrom = prev[from].filter((c: any) => c.id !== card.id);
            const newTo = [...prev[to], card];
            return { ...prev, [from]: newFrom, [to]: newTo };
        });
    }, []);

    return {
        selectedIndices, setSelectedIndices,
        minimized, setMinimized,
        orderedTriggers, setOrderedTriggers,
        scryState, setScryState,
        viewedPlayerId, setViewedPlayerId,
        sourceObject,
        handleChoiceClick,
        handleChoiceRightClick,
        moveCard,
        choices,
        minChoices,
        maxChoices
    };
};
