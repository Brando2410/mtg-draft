import { AbilityType, CardDefinition, DynamicAmount, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const TheDawningArchaic: CardDefinition = {
    name: "The Dawning Archaic",
    manaCost: "{10}",
    scryfall_id: "71f760e9-b541-477a-b911-45186b520ae1", // placeholder
    colors: [],
    types: ["Creature"],
    subtypes: ["Avatar"],
    keywords: ["Reach"],
    oracleText: "This spell costs {1} less to cast for each instant and sorcery card in your graveyard.\nReach\nWhenever The Dawning Archaic attacks, you may cast target instant or sorcery card from your graveyard without paying its mana cost. If that spell would be put into your graveyard, exile it instead.",
    supertypes: ["Legendary"],
    abilities: [
        {
            type: AbilityType.Static,
            activeZone: Zone.Hand,
            effects: [
                {
                    type: EffectType.CostReduction,
                    amount: DynamicAmount.InstantsAndSorceriesInGraveyard,
                    targetMapping: TargetMapping.Self
                }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Attack,
            targetDefinition: {
                type: TargetType.CardInGraveyard,
                restrictions: [Restriction.InstantOrSorcery, Restriction.YouOwn],
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
                                    type: EffectType.CastSpell,
                                    targetMapping: TargetMapping.Target1,
                                    free: true,
                                    exileOnResolution: true
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
