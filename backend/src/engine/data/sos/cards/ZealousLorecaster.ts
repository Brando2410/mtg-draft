import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
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
    image_url: "https://cards.scryfall.io/png/front/3/6/36ab2130-9f21-4d30-873a-aa72d3d15fa8.png",
    abilities: [
        {
            id: "zealous_lorecaster_etb",
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: CostType.Choice,
                    label: "Choose an instant or sorcery card in your graveyard to return to your hand",
                    targetIdMapping: 'CONTROLLER_GRAVEYARD',
                    restrictions: ['InstantOrSorcery'],
                    effects: [
                        {
                            type: EffectType.ReturnToHand,
                            targetMapping: TargetMapping.Target1
                        }
                    ]
                }
            ]
        }
    ],
    power: "4",
    toughness: "4"
};
    