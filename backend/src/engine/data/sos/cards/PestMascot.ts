import { TargetMapping, AbilityType, CardDefinition, ConditionType, EffectType, TargetType, TriggerEvent } from '@shared/engine_types';
    export const PestMascot: CardDefinition = {
    name: "Pest Mascot",
    manaCost: "{1}{B}{G}",
    scryfall_id: "d882beb9-6766-4818-afbb-f6fd7a2d5b70",
    rarity: "common",
    image_url: "https://cards.scryfall.io/normal/front/d/8/d882beb9-6766-4818-afbb-f6fd7a2d5b70.jpg?1775938452",
    colors: [
        "B",
        "G"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Pest",
        "Ape"
    ],
    keywords: ["Trample"],
    oracleText: "Trample\nWhenever you gain life, put a +1/+1 counter on this creature.",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.LifeGain,
            condition: ConditionType.PlayerIsController,
            effects: [
                {
                    type: EffectType.AddCounters,
                    counterType: '+1/+1',
                    amount: 1,
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
    power: "2",
    toughness: "3"
};
    

