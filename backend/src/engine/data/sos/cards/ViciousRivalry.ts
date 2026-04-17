import { AbilityType, CardDefinition, CostType, DynamicAmount, EffectType } from '@shared/engine_types';
    export const ViciousRivalry: CardDefinition = {
    name: "Vicious Rivalry",
    manaCost: "{2}{B}{G}",
    colors: [
        "B",
        "G"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "As an additional cost to cast this spell, pay X life.\nDestroy all artifacts and creatures with mana value X or less.",
    abilities: [
        {
            type: AbilityType.Spell,
            additionalCosts: [
                { type: CostType.PayLife, value: DynamicAmount.X } as any
            ],
            effects: [
                {
                    type: EffectType.Destroy,
                    selectionType: 'All' as any,
                    restrictions: [
                { type: 'ManaValueLessOrEqual',
                amount: DynamicAmount.X },
                { type: 'Type', value: 'ArtifactOrCreature' }
            ],
                    targetMapping: 'MATCHING_PERMANENTS'
                }
            ]
        }
    ]
};
    