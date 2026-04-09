import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const IndulgentAristocrat: Record<string, ImplementableCard> = {
    "Indulgent Aristocrat": {
        name: "Indulgent Aristocrat",
        manaCost: "{B}",
        oracleText: "Lifelink\n{2}, Sacrifice a creature: Put a +1/+1 counter on each Vampire you control.",
        colors: ["black"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Vampire"],
        power: "1",
        toughness: "1",
        keywords: ["Lifelink"],
        set: "SOI",
        abilities: [
            {
                id: "indulgent_aristocrat_sacrifice",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [
                    { type: 'Mana', value: '{2}' },
                    { type: 'Sacrifice', restrictions: ['Creature'] }
                ],
                effects: [{
                    type: 'AddCounters',
                    amount: 1,
                    value: '+1/+1',
                    targetMapping: 'MATCHING_PERMANENTS_YOU_CONTROL',
                    restrictions: ['Vampire']
                }]
            }
        ]
    }
};
