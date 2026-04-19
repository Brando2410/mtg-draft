import { AbilityType, CardDefinition, ConditionType, DurationType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
export const ExpressiveFiredancer: CardDefinition = {
    name: "Expressive Firedancer",
    manaCost: "{1}{R}",
    scryfall_id: "259b8c45-6241-4206-a34e-34c7f401f47b",
    rarity: "common",
    image_url: "https://cards.scryfall.io/normal/front/2/5/259b8c45-6241-4206-a34e-34c7f401f47b.jpg?1775937734",
    colors: [
        "R"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Human",
        "Sorcerer"
    ],
    keywords: [],
    oracleText: "Opus — Whenever you cast an instant or sorcery spell, this creature gets +1/+1 until end of turn. If five or more mana was spent to cast that spell, this creature also gains double strike until end of turn.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastInstantOrSorcery,
            condition: ConditionType.PlayerIsController,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: { type: DurationType.UntilEndOfTurn },
                    powerModifier: 1,
                    toughnessModifier: 1,
                    targetMapping: TargetMapping.Self
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    condition: 'SPENT_MANA_GE:5',
                    duration: { type: DurationType.UntilEndOfTurn },
                    abilitiesToAdd: ['Double Strike'],
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
    power: "2",
    toughness: "2"
};

