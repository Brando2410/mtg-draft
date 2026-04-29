import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';
    export const AdventurousEaterHaveaBite: CardDefinition = {
    name: "Adventurous Eater // Have a Bite",
    manaCost: "{2}{B} // {B}",
    scryfall_id: "d40cc7da-c731-418e-8547-7033d1939450",
    rarity: "common",
    image_url: "https://cards.scryfall.io/normal/front/d/4/d40cc7da-c731-418e-8547-7033d1939450.jpg?1775937412",
    colors: [
        "B"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Human",
        "Warlock"
    ],
    keywords: ["Prepared"],
    oracleText: "This creature enters prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
    power: "3",
    toughness: "2",

    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [{ type: EffectType.Prepare, targetMapping: TargetMapping.Self }]
        }
    ],
    preparedFace: {
        name: "Have a Bite",
        image_url: "https://cards.scryfall.io/png/front/d/4/d40cc7da-c731-418e-8547-7033d1939450.png?1775937412",
        manaCost: "{B}",
        colors: ["B"],
        types: ["Sorcery"],
        oracleText: "Put a +1/+1 counter on target creature. You gain 1 life.",
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinition: { type: TargetType.Creature },
                effects: [
                    { type: EffectType.AddCounters, amount: 1, counterType: '+1/+1', targetMapping: TargetMapping.Target1 },
                    { type: EffectType.GainLife, amount: 1, targetMapping: TargetMapping.Controller }
                ]
            }
        ]
    }
};
    
