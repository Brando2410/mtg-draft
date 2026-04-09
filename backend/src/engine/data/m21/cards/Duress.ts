import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const Duress: Record<string, ImplementableCard> = {
    "Duress": {
        name: "Duress",
        manaCost: "{B}",
        oracleText: "Target opponent reveals their hand. You choose a noncreature, nonland card from it. That player discards that card.",
        colors: ["black"],
        supertypes: [],
        types: ["Sorcery"],
        subtypes: [],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "duress_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                targetDefinition: { type: 'Player', count: 1, restrictions: ['Opponent'] },
                effects: [
                    {
                        type: 'Choice',
                        label: 'Choose a noncreature, nonland card',
                        targetMapping: 'TARGET_1',
                        targetIdMapping: 'TARGET_1_HAND',
                        restrictions: ['Noncreature', 'Nonland'],
                        effects: [{ type: 'DiscardCards', amount: 1, targetMapping: 'SELECTED_CARD' }]
                    }
                ]
            }
        ]
    }
};
