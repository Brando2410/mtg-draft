import { AbilityType, CardDefinition, CostType, DynamicAmount, EffectType, Restriction, TargetMapping } from '@shared/engine_types';

export const ViciousRivalry: CardDefinition = {
    name: "Vicious Rivalry",
    manaCost: "{2}{B}{G}",
    colors: ["B", "G"],
    types: ["Sorcery"],
    subtypes: [],
    keywords: [],
    oracleText: "As an additional cost to cast this spell, pay X life.\nDestroy all artifacts and creatures with mana value X or less.",
    abilities: [
        {
            type: AbilityType.Spell,
            additionalCosts: [
                {
                    type: CostType.PayLife,
                    value: DynamicAmount.X
                }
            ],
            effects: [
                {
                    type: EffectType.Destroy,
                    targetMapping: TargetMapping.AllMatchingPermanents,
                    restrictions: [
                        Restriction.ArtifactOrCreature,
                        Restriction.ManaValueLessOrEqualToX
                    ]
                }
            ]
        }
    ]
};
