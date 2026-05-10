import { AbilityType, CardDefinition, ConditionType, DurationType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
    export const PoisonersApprentice: CardDefinition = {
    name: "Poisoner's Apprentice",
    manaCost: "{2}{B}",


    colors: [
        "B"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Orc",
        "Warlock"
    ],
    keywords: [],
    oracleText: "Infusion — When this creature enters, target creature an opponent controls gets -4/-4 until end of turn if you gained life this turn.",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.ConditionalEffect,
                    condition: ConditionType.Infusion,
                    effects: [
                        {
                            type: EffectType.ApplyContinuousEffect,
                            duration: { type: DurationType.UntilEndOfTurn },
                            powerModifier: -4,
                            toughnessModifier: -4,
                            targetMapping: TargetMapping.EachOpponentCreature
                        }
                    ]
                }
            ]
        }
    ],
    power: "2",
    toughness: "2",
    scryfall_id: "3755a2e9-af55-4625-a006-2a86c7893a96",
    image_url: "https://cards.scryfall.io/normal/front/3/7/3755a2e9-af55-4625-a006-2a86c7893a96.jpg?1775937552",
    rarity: "uncommon"
};

