import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const LilianasSteward: CardDefinition = {
    name: "Liliana's Steward",
    manaCost: "{B}",
    oracleText: "{T}, Sacrifice this creature: Target opponent discards a card. Activate only as a sorcery.",
    colors: ["B"],
    types: ["Creature"],
    subtypes: ["Zombie"],
    power: "1",
    toughness: "2",
    abilities: [
        {
            type: AbilityType.Activated,
            activeZone: Zone.Battlefield,
            activatedOnlyAsSorcery: true,
            costs: [
                { type: EffectType.Tap },
                { type: EffectType.Sacrifice, targetMapping: TargetMapping.Self }
            ],
            targetDefinition: {
                type: TargetType.Opponent,
                count: 1,
            },
            effects: [{ type: EffectType.DiscardCards, amount: 1, targetMapping: TargetMapping.Target1 }]
        }
    ]
};


