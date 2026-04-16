import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const SpiritcallEnthusiastScrollboost: CardDefinition = {
    name: "Spiritcall Enthusiast",
    manaCost: "{2}{W}",
    colors: ["W"],
    types: ["Creature"],
    subtypes: ["Cat", "Cleric"],
    power: "3",
    toughness: "3",
    oracleText: "Whenever one or more tokens you control enter, this creature becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefieldOther,
            condition: 'OWN_TOKEN_ENTERS',
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
                targetDefinition: {
                    type: TargetType.Creature,
                    count: 2,
                    minCount: 1
                },
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
        ]
    }
};

