import { AbilityType, CardDefinition, ConditionType, DurationType, EffectType, Restriction, TargetMapping } from '@shared/engine_types';

export const WitheringCurse: CardDefinition = {
    name: "Withering Curse",
    manaCost: "{1}{B}{B}",
    colors: [
        "B"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "All creatures get -2/-2 until end of turn.\nInfusion — If you gained life this turn, destroy all creatures instead.",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.ConditionalEffect,
                    effects: [
                        {
                            condition: ConditionType.Infusion,
                            type: EffectType.Destroy,
                            targetMapping: TargetMapping.AllMatchingPermanents,
                            restrictions: [Restriction.Creature]
                        },
                        {
                            condition: '!' + ConditionType.Infusion,
                            type: EffectType.ApplyContinuousEffect,
                            duration: { type: DurationType.UntilEndOfTurn },
                            powerModifier: -2,
                            toughnessModifier: -2,
                            targetMapping: TargetMapping.AllMatchingPermanents,
                            restrictions: [Restriction.Creature]
                        }
                    ]
                }
            ]
        }
    ],
    scryfall_id: "50aaf618-dddb-4cbe-8231-d634b4498563",
    image_url: "https://cards.scryfall.io/normal/front/5/0/50aaf618-dddb-4cbe-8231-d634b4498563.jpg?1775937655",
    rarity: "mythic"
};

