import { AbilityType, CardDefinition, ConditionType, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const EmeritusofTruceSwordstoPlowshares: CardDefinition = {
    name: "Emeritus of Truce // Swords to Plowshares",
    manaCost: "{1}{W}{W}",
    scryfall_id: "9869a753-5e41-4098-ab41-e75b4396ec50",
    rarity: "mythic",
    image_url: "https://cards.scryfall.io/normal/front/9/8/9869a753-5e41-4098-ab41-e75b4396ec50.jpg?1775936999",
    colors: ["W"],
    types: ["Creature"],
    subtypes: ["Cat", "Cleric"],
    keywords: ['Flying'],
    oracleText: "When this creature enters, target player creates a 1/1 white and black Inkling creature token with flying. Then if an opponent controls more creatures than you, this creature becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
    power: "3",
    toughness: "3",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            targetDefinition: {
                type: TargetType.Player,
                count: 1
            },
            effects: [
                {
                    type: EffectType.CreateToken,
                    targetMapping: TargetMapping.Target1,
                    tokenBlueprint: {
                        name: 'Inkling',
                        colors: ['W', 'B'],
                        types: ['Creature'],
                        subtypes: ['Inkling'],
                        power: 1,
                        toughness: 1,
                        keywords: ['Flying'],
                        image_url: 'https://cards.scryfall.io/png/front/c/9/c9deae5c-80d4-4701-b425-91853b7ee03b.png?1682693898'
                    }
                },
                {
                    type: EffectType.ConditionalEffect,
                    condition: ConditionType.OpponentControlsMoreCreatures,
                    effects: [
                        {
                            type: EffectType.Prepare,
                            targetMapping: TargetMapping.Self
                        }
                    ]
                }
            ]
        }
    ],
    preparedFace: {
        name: "Swords to Plowshares",
        image_url: "https://cards.scryfall.io/normal/front/9/8/9869a753-5e41-4098-ab41-e75b4396ec50.jpg?1775936999",
        manaCost: "{W}",
        colors: ["W"],
        types: ["Instant"],
        oracleText: "Exile target creature. Its controller gains life equal to its power.",
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinition: {
                    type: TargetType.Creature,
                    count: 1
                },
                effects: [
                    {
                        type: EffectType.Exile,
                        targetMapping: TargetMapping.Target1
                    },
                    {
                        type: EffectType.GainLife,
                        amount: DynamicAmount.Target1Power,
                        targetMapping: TargetMapping.Target1Controller
                    }
                ]
            }
        ]
    }
};
