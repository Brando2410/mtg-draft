import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const ZealousLorecaster: CardDefinition = {
    name: "Zealous Lorecaster",
    manaCost: "{5}{R}",
    colors: [
        "R"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Giant",
        "Sorcerer"
    ],
    keywords: [],
    oracleText: "When this creature enters, return target instant or sorcery card from your graveyard to your hand.",

    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.Choice,
                    label: "Return an instant or sorcery card",
                    selectionPool: TargetMapping.ControllerGraveyard,
                    targetDefinitions: [{
                        type: TargetType.CardInGraveyard,
                        restrictions: [Restriction.InstantOrSorcery],
                        count: 1
                    }],
                    effects: [
                        {
                            type: EffectType.ReturnToHand
                        }
                    ]
                }
            ]
        }
    ],
    power: "4",
    toughness: "4",
    scryfall_id: "36ab2130-9f21-4d30-873a-aa72d3d15fa8",
    image_url: "https://cards.scryfall.io/normal/front/3/6/36ab2130-9f21-4d30-873a-aa72d3d15fa8.jpg?1775937928",
    rarity: "common"
};

