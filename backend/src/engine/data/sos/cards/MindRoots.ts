import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
    export const MindRoots: CardDefinition = {
    name: "Mind Roots",
    manaCost: "{1}{B}{G}",
    colors: [
        "B",
        "G"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Target player discards two cards. Put up to one land card discarded this way onto the battlefield tapped under your control.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Player,
                count: 1
            },
            effects: [
                {
                    type: EffectType.DiscardCards,
                    amount: 2,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.MoveToZone,
                    zone: 'BATTLEFIELD',
                    entersTapped: true,
                    targetDefinition: {
                        type: TargetType.CardInGraveyard,
                        count: [0, 1],
                        restrictions: ['Land']
                    },
                    // Use a special mapping that filters cards discarded by current spell
                    targetMapping: TargetMapping.LastDiscardedCards
                }
            ]
        }
    ]
};
    