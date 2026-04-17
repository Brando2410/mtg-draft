import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping } from '@shared/engine_types';
    export const MoltenNote: CardDefinition = {
    name: "Molten Note",
    manaCost: "{X}{R}{W}",
    colors: [
        "R",
        "W"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: ["Flashback"],
    oracleText: "Molten Note deals damage to target creature equal to the amount of mana spent to cast this spell. Untap all creatures you control.\nFlashback {6}{R}{W} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
    flashbackCost: "{6}{R}{W}",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: DurationType.Permanent,
                restrictions: [
                { type: 'Type', value: 'Creature' }
            ],
                count: 1
            },
            effects: [
                {
                    type: EffectType.DealDamage,
                    amount: 'EVENT_PAID_MANA',
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.Untap,
                    targetMapping: TargetMapping.AllCreaturesYouControl
                }
            ]
        }
    ]
};
    