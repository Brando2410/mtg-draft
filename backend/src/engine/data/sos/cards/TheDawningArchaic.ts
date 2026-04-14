import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent, TargetType, ZoneRequirement } from '@shared/engine_types';

export const TheDawningArchaic: CardDefinition = {
    "name": "The Dawning Archaic",
    "manaCost": "{10}",
    "colors": [],
    "supertypes": [
        "Legendary"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Avatar"
    ],
    "oracleText": "This spell costs {1} less to cast for each instant and sorcery card in your graveyard.\nReach\nWhenever The Dawning Archaic attacks, you may cast target instant or sorcery card from your graveyard without paying its mana cost. If that spell would be put into your graveyard, exile it instead.",
    "keywords": [
        "Reach"
    ],
    "abilities": [
        {
            type: AbilityType.Static,
            activeZone: ZoneRequirement.Hand,
            effects: [
                {
                    type: EffectType.CostReduction,
                    amount: 'INSTANTS_AND_SORCERIES_IN_GRAVEYARD',
                    targetMapping: 'SELF'
                }
            ]
        },
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Attack,
            targetDefinition: {
                type: TargetType.CardInGraveyard,
                restrictions: [
                    'Instant_or_Sorcery'
                ],
                count: 1
            },
            effects: [
                {
                    type: EffectType.Choice,
                    label: "Cast target instant or sorcery from graveyard?",
                    choices: [
                        {
                            label: "Yes",
                            effects: [
                                {
                                    type: EffectType.AllowCastWithoutPaying,
                                    targetMapping: TargetMapping.Target1,
                                    exileOnMoveToGraveyard: true
                                }
                            ]
                        },
                        {
                            label: "No",
                            effects: []
                        }
                    ]
                }
            ]
        }
    ],
    "power": "7",
    "toughness": "7"
};



