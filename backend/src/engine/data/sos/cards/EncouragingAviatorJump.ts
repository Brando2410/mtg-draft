import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';
    export const EncouragingAviatorJump: CardDefinition = {
    name: "Encouraging Aviator // Jump",
    manaCost: "{2}{U} // {U}",
    colors: [
        "U"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Bird",
        "Wizard"
    ],
    keywords: ["Flying", "Prepared"],
    oracleText: "Flying\nWhenever this creature attacks, it becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
    power: "2",
    toughness: "3",
    image_url: "https://cards.scryfall.io/png/front/7/2/72654b84-9902-41db-92ab-a3499c31221c.png?1775937230",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Attack,
            effects: [
                {
                    type: EffectType.Prepare,
                    targetMapping: TargetType.Self
                }
            ]
        }
    ],
    preparedFace: {
        name: "Jump",
        image_url: "https://cards.scryfall.io/png/front/2/e/2edd7be9-9334-4684-b642-1aaf2000e054.png?1561975305",
        manaCost: "{U}",
        colors: ["U"],
        types: ["Instant"],
        oracleText: "Target creature gains flying until end of turn.",
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinition: {
                    type: 'Creature',
                    count: 1
                },
                effects: [
                    {
                        type: EffectType.ApplyContinuousEffect,
                        targetMapping: TargetMapping.Target1,
                        duration: DurationType.UntilEndOfTurn,
                        abilitiesToAdd: ['Flying']
                    }
                ]
            }
        ]
    }
};
    