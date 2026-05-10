import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from "@shared/engine_types";

export const QuirionDryad: CardDefinition = {
    name: "Quirion Dryad",
    manaCost: "{1}{G}",

    oracleText: "Whenever you cast a spell that's white, blue, black, or red, put a +1/+1 counter on this creature.",
    colors: ["G"],
    types: ["Creature"],
    subtypes: ["Dryad"],
    power: "1",
    toughness: "1",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastSpell,
            condition: 'PLAYER_IS_CONTROLLER_AND_SPELL_IS_NOT_GREEN_OR_COLORLESS',
            effects: [{
                type: EffectType.AddCounters,
                counterType: '+1/+1',
                amount: 1,
                targetMapping: TargetMapping.Self
            }]
        }
    ],
    scryfall_id: "a20d20f7-bc4d-42fa-9f5b-5bb330eb7f38",
    image_url: "https://cards.scryfall.io/normal/front/a/2/a20d20f7-bc4d-42fa-9f5b-5bb330eb7f38.jpg?1594737152",
    rarity: "uncommon"
};

