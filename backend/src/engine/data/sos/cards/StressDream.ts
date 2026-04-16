import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, Zone } from '@shared/engine_types';
    export const StressDream: CardDefinition = {
    name: "Stress Dream",
    manaCost: "{3}{U}{R}",
    colors: [
        "R",
        "U"
    ],
    types: [
        "Instant"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Stress Dream deals 5 damage to up to one target creature. Look at the top two cards of your library. Put one of those cards into your hand and the other on the bottom of your library.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: DurationType.Permanent,
                maxSelections: 1,
                restrictions: ['Creature']
            },
            effects: [
                {
                    type: EffectType.DealDamage,
                    amount: 5,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.LookAtTopAndPick,
                    fromTop: 2,
                    amount: 1,
                    zone: Zone.Hand,
                    remainderZone: Zone.Library,
                    remainderPosition: 'bottom',
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};
    