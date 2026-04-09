import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const LilianasSteward: Record<string, ImplementableCard> = {
    "Liliana's Steward": {
        name: "Liliana's Steward",
        manaCost: "{B}",
        oracleText: "{T}, Sacrifice this creature: Target opponent discards a card. Activate only as a sorcery.",
        colors: ["black"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Zombie"],
        power: "1",
        toughness: "2",
        keywords: [],
        abilities: [
            {
                id: "liliana_steward_sacrifice",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                activatedOnlyAsSorcery: true,
                costs: [{ type: 'Tap', value: null }, { type: 'Sacrifice', targetMapping: 'SELF' }],
                targetDefinition: { type: 'Player', count: 1, restrictions: ['Opponent'] },
                effects: [{ type: 'DiscardCards', amount: 1, targetMapping: 'TARGET_1' }]
            }
        ]
    }
};
