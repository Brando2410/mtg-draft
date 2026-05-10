import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';
export const EmeritusofConflictLightningBolt: CardDefinition = {
    name: "Emeritus of Conflict // Lightning Bolt",
    manaCost: "{1}{R}",


    colors: ["R"],
    types: ["Creature"],
    subtypes: ["Human", "Wizard"],
    keywords: ["First strike", "Prepared"],
    oracleText: "First strike\nWhenever you cast your third spell each turn, this creature becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
    power: "2",
    toughness: "2",

    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.ThirdSpellCast,
            effects: [
                {
                    type: EffectType.Prepare,
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
    preparedFace: {
        name: "Lightning Bolt",

        manaCost: "{R}",
        colors: ["R"],
        types: ["Instant"],
        oracleText: "Lightning Bolt deals 3 damage to any target.",
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinitions: [{
                    type: TargetType.AnyTarget,
                    count: 1
                }],
                effects: [
                    {
                        type: EffectType.DealDamage,
                        amount: 3,
                        targetMapping: TargetMapping.Target1
                    }
                ]
            }
        ],

    },
    scryfall_id: "f58dba4f-1abb-47a3-a684-29c32bab95c0",
    image_url: "https://cards.scryfall.io/png/front/7/7/77c6fa74-5543-42ac-9ead-0e890b188e99.png?1706239968",
    rarity: "mythic"
};

