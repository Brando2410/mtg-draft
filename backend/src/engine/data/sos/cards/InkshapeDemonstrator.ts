import { AbilityType, CardDefinition, ConditionType, DurationType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
    export const InkshapeDemonstrator: CardDefinition = {
    name: "Inkshape Demonstrator",
    manaCost: "{3}{W}",
    scryfall_id: "bcfac992-9984-4529-b9ff-a42d58832b34",
    rarity: "uncommon",
    image_url: "https://cards.scryfall.io/normal/front/b/c/bcfac992-9984-4529-b9ff-a42d58832b34.jpg?1775937053",
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
            condition: ConditionType.ReparteeTrigger,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    powerModifier: 1,
                    abilitiesToAdd: ["Lifelink"],
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
    power: "3",
    toughness: "4"
};
    

