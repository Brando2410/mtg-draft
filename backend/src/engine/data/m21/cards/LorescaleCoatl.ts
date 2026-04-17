import { AbilityType, Zone, CardDefinition, EffectType, TargetMapping, TriggerEvent } from "@shared/engine_types";

export const LorescaleCoatl: CardDefinition = {

    name: "Lorescale Coatl",
    manaCost: "{1}{G}{U}",
    scryfall_id: "3be31fb0-115e-4e62-babd-16870f249f06",
    image_url: "https://cards.scryfall.io/normal/front/3/b/3be31fb0-115e-4e62-babd-16870f249f06.jpg?1594737402",
    oracleText: "Whenever you draw a card, put a +1/+1 counter on this creature.",
    colors: ["G", "U"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Snake"],
    power: "2",
    toughness: "2",
    keywords: [],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Draw,
            condition: 'EVENT_PLAYER_IS_YOU',
            effects: [{
                type: EffectType.AddCounters,
                counterType: 'p1p1',
                amount: 1,
                targetMapping: TargetMapping.Self
            }],

        }
    ]

};


