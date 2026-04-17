import { AbilityType, CardDefinition, DurationType, EffectType, TargetType, TriggerEvent } from '@shared/engine_types';
    export const InkshapeDemonstrator: CardDefinition = {
    name: "Inkshape Demonstrator",
    manaCost: "{3}{W}",
    colors: [
        "W"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Elephant",
        "Cleric"
    ],
    keywords: ["Ward {2}"],
    oracleText: "Ward {2} (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {2}.)\nRepartee — Whenever you cast an instant or sorcery spell that targets a creature, this creature gets +1/+0 and gains lifelink until end of turn.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastInstantOrSorcery,
            condition: 'REPARTEE_TRIGGER',
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    powerModifier: 1,
                    abilitiesToAdd: ["Lifelink"],
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetType.Self
                }
            ]
        }
    ],
    power: "3",
    toughness: "4"
};
    