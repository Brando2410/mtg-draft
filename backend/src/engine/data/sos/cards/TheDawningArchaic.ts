import { AbilityType, CardDefinition, DynamicAmount, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const TheDawningArchaic: CardDefinition = {
    name: "The Dawning Archaic",
    manaCost: "{10}",
    colors: [],
    types: ["Creature"],
    subtypes: ["Avatar"],
    keywords: ["Reach"],
    power: "7",
    toughness: "7",
    oracleText: "This spell costs {1} less to cast for each instant and sorcery card in your graveyard.\nReach\nWhenever The Dawning Archaic attacks, you may cast target instant or sorcery card from your graveyard without paying its mana cost. If that spell would be put into your graveyard, exile it instead.",
    supertypes: ["Legendary"],
    abilities: [
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.CostReduction,
                    reductionAmount: DynamicAmount.InstantSorceryInGraveyardCount,
                    targetMapping: TargetMapping.Self
                }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Attack,
            effects: [
                {
                    type: EffectType.Choice,
                    label: "Choose target instant or sorcery card from your graveyard",
                    selectionPool: TargetMapping.ControllerGraveyard,
                    targetDefinitions: [{
                        type: TargetType.CardInGraveyard,
                        restrictions: [Restriction.InstantOrSorcery, Restriction.YouOwn],
                        optional: true,
                        minCount: 0,
                        count: 1
                    }],
                    isSpellCasting: true,
                    isFreeCast: true,

                    effects: [
                        {
                            type: EffectType.CastSpell,
                            isSpellCasting: true,
                            isFreeCast: true,
                            exileOnResolution: true
                        }
                    ]


                }
            ]
        }
    ],
    scryfall_id: "7a451985-37e1-44d8-839b-dc1e88df5c96",
    image_url: "https://cards.scryfall.io/normal/front/7/a/7a451985-37e1-44d8-839b-dc1e88df5c96.jpg?1775936921",
    rarity: "mythic"
};

