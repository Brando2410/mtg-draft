import { AbilityType, CardDefinition, ConditionType, DurationType, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';
    export const SpiritcallEnthusiastScrollboost: CardDefinition = {
    name: "Spiritcall Enthusiast",
    manaCost: "{2}{W}",
    colors: ["W"],
    types: ["Creature"],
    subtypes: ["Cat", "Cleric"],
    keywords: [],
    oracleText: "Whenever one or more tokens you control enter, this creature becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
    power: "3",
    toughness: "3",

    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefieldOther,
            condition: ConditionType.OwnTokenEnters,
            effects: [
                {
                    type: EffectType.Prepare,
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
    // SOS: Mechanic "Prepare" - the spell face accessible when prepared
    preparedFace: {
        name: "Scrollboost",
        manaCost: "{1}{W}",
        colors: ["W"],
        types: ["Sorcery"],
        subtypes: [],
        oracleText: "One or two target creatures each get +2/+2 until end of turn.",
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinitions: [{
                    type: TargetType.Creature,
                    count: 2,
                    minCount: 1
                }],
                effects: [
                    {
                        type: EffectType.ApplyContinuousEffect,
                        powerModifier: 2,
                        toughnessModifier: 2,
                        duration: { type: DurationType.UntilEndOfTurn },
                        targetMapping: TargetMapping.TargetAll
                    }
                ]
            }
        ],
    },
    scryfall_id: "c0b85569-2cb3-4b64-b0fe-418195c4dab0",
    image_url: "https://cards.scryfall.io/normal/front/c/0/c0b85569-2cb3-4b64-b0fe-418195c4dab0.jpg?1775937144",
    rarity: "uncommon"
};

