import { AbilityType, CardDefinition, ConditionType, CostType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
export const MicaReaderofRuins: CardDefinition = {
    name: "Mica, Reader of Ruins",
    manaCost: "{3}{R}",
    scryfall_id: "949ad3ff-9e80-493c-a3ae-146b919bfcd7",
    image_url: "https://cards.scryfall.io/normal/front/9/4/949ad3ff-9e80-493c-a3ae-146b919bfcd7.jpg?1775937824",
    colors: [
        "R"
    ],
    types: [
        "Legendary",
        "Creature"
    ],
    subtypes: [
        "Human",
        "Artificer"
    ],
    keywords: ["Ward—Pay 3 life"],
    oracleText: "Ward—Pay 3 life. (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays 3 life.)\nWhenever you cast an instant or sorcery spell, you may sacrifice an artifact. If you do, copy that spell and you may choose new targets for the copy.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastInstantOrSorcery,
            condition: `${ConditionType.ControllerHasArtifact} && ${ConditionType.EventPlayerIsYou}`,
            effects: [
                {
                    type: EffectType.Choice,
                    label: "Sacrifice an artifact to copy the spell?",
                    choices: [
                        {
                            label: "Sacrifice an artifact",
                            effects: [
                                {
                                    type: CostType.Sacrifice,
                                    targetMapping: TargetMapping.Controller,
                                    restrictions: [
                                        "Artifact"
                                    ]
                                },
                                {
                                    type: EffectType.CopySpellOnStack,
                                    targetMapping: TargetMapping.TriggerEventSource,
                                    chooseNewTargets: true
                                }
                            ]
                        },
                        { label: "Decline", effects: [] }
                    ]
                }
            ]
        }
    ],
    power: "4",
    toughness: "4"
};
