import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const TeferisAgelessInsight: Record<string, ImplementableCard> = {
    "Teferi's Ageless Insight": {
        name: "Teferi's Ageless Insight",
        manaCost: "{2}{U}{U}",
        oracleText: "If you would draw a card except the first one you draw in each of your draw steps, draw two cards instead.",
        colors: ["blue"],
        supertypes: ["Legendary"],
        types: ["Enchantment"],
        subtypes: [],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "teferi_ageless_replacement",
                type: AbilityType.Replacement,
                activeZone: ZoneRequirement.Battlefield,
                replacesEvent: 'ON_DRAW',
                triggerCondition: (state: any) => (state.turnState.cardsDrawnThisTurn || 0) >= 1,
                effects: [{ type: 'ModifyDrawAmount', multiplier: 2, targetMapping: 'CONTROLLER' }]
            }
        ]
    }
};
