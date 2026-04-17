import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';
    export const TheDawningArchaic: CardDefinition = {
    name: "The Dawning Archaic",
    manaCost: "{10}",
    colors: [],
    types: [
        "Creature"
    ],
    subtypes: [
        "Avatar"
    ],
    keywords: [
        "Reach"
    ],
    oracleText: "This spell costs {1} less to cast for each instant and sorcery card in your graveyard.\nReach\nWhenever The Dawning Archaic attacks, you may cast target instant or sorcery card from your graveyard without paying its mana cost. If that spell would be put into your graveyard, exile it instead.",
    supertypes: [
        "Legendary"
    ],
    abilities: [
        {
            type: AbilityType.Static,
            activeZone: Zone.Hand,
            effects: [
                {
                    type: EffectType.CostReduction,
                    amount: 'INSTANTS_AND_SORCERIES_IN_GRAVEYARD',
                    targetMapping: TargetType.Self
                }
            ]
        },
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Attack,
            targetDefinition: {
                type: TargetType.CardInGraveyard,
                restrictions: [
                { type: 'Type', value: 'InstantOrSorcery' }
            ],
                count: 1
            },
            effects: [
                {
                    type: CostType.Choice,
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
    power: "7",
    toughness: "7"
};
    