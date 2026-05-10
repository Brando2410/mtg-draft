import { AbilityType, CardDefinition, CostType, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';
export const StrixhavenSkycoach: CardDefinition = {
    name: "Strixhaven Skycoach",
    manaCost: "{3}",
    colors: [],
    types: [
        "Artifact"
    ],
    subtypes: [
        "Vehicle"
    ],
    keywords: ["Flying", "Crew 2"],
    power: "3",
    toughness: "2",
    oracleText: "Flying\nWhen this Vehicle enters, you may search your library for a basic land card, reveal it, put it into your hand, then shuffle.\nCrew 2 (Tap any number of creatures you control with total power 2 or more: This Vehicle becomes an artifact creature until end of turn.)",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.SearchLibrary,
                    targetDefinitions: [{
                        type: TargetType.Land,
                        count: 1,
                        restrictions: [Restriction.Basic]
                    }],
                    optional: true,
                    reveal: true,
                    zone: Zone.Hand,
                    targetMapping: TargetMapping.Controller
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Crew, value: 2 }],
            effects: [
                {
                    type: EffectType.CREW,
                    targetMapping: TargetMapping.Self,
                    powerOverride: 3,
                    toughnessOverride: 2
                }
            ]
        }
    ],
    scryfall_id: "87741fbb-b426-4f83-a358-587b0907f081",
    image_url: "https://cards.scryfall.io/normal/front/8/7/87741fbb-b426-4f83-a358-587b0907f081.jpg?1775938759",
    rarity: "uncommon"
};

