import { AbilityType, CardDefinition, ConditionType, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const EmeritusofTruceSwordstoPlowshares: CardDefinition = {
    name: "Emeritus of Truce // Swords to Plowshares",
    manaCost: "{1}{W}{W}",
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
            targetDefinitions: [{
                type: TargetType.Player,
                count: 1
            }],
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
                        image_url: "https://cards.scryfall.io/normal/front/b/a/bab52920-9d67-4cd4-9015-6e645ff9764f.jpg?1777982214"
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

        manaCost: "{W}",
        colors: ["W"],
        types: ["Instant"],
        oracleText: "Exile target creature. Its controller gains life equal to its power.",
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinitions: [{
                    type: TargetType.Creature,
                    count: 1
                }],
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
        ],

    },
    scryfall_id: "9869a753-5e41-4098-ab41-e75b4396ec50",
    image_url: "https://cards.scryfall.io/normal/front/9/8/9869a753-5e41-4098-ab41-e75b4396ec50.jpg?1775936999",
    rarity: "mythic"
};

