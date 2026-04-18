import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
    export const PestbroodSloth: CardDefinition = {
    name: "Pestbrood Sloth",
    manaCost: "{3}{G}",
    scryfall_id: "c1251ae6-2f19-4f84-ab02-6a6cc7ce6056",
    rarity: "uncommon",
    image_url: "https://cards.scryfall.io/normal/front/c/1/c1251ae6-2f19-4f84-ab02-6a6cc7ce6056.jpg?1775938073",
    colors: [
        "G"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Plant",
        "Sloth"
    ],
    keywords: ["Reach"],
    oracleText: "Reach\nWhen this creature dies, create two 1/1 black and green Pest creature tokens with \"Whenever this token attacks, you gain 1 life.\"",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Death,
            effects: [
                {
                    type: EffectType.CreateToken,
                    amount: 2,
                    tokenBlueprint: {
                        name: "Pest",
                        colors: ["B", "G"],
                        types: ["Creature"],
                        subtypes: ["Pest"],
                        power: "1",
                        toughness: "1",
                        oracleText: "Whenever this token attacks, you gain 1 life.",
                        abilities: [
                            {
                                type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Attack,
                                condition: 'EVENT_SOURCE_IS_SELF',
                                effects: [
                                    {
                                        type: EffectType.GainLife,
                                        amount: 1,
                                        targetMapping: TargetMapping.Controller
                                    }
                                ]
                            }
                        ]
                    },
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    power: "4",
    toughness: "4"
};
    
