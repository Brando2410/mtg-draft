import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from "@shared/engine_types";

export const QuirionDryad: CardDefinition = {

    name: "Quirion Dryad",
    manaCost: "{1}{G}",
    scryfall_id: "a20d20f7-bc4d-42fa-9f5b-5bb330eb7f38",
    image_url: "https://cards.scryfall.io/normal/front/a/2/a20d20f7-bc4d-42fa-9f5b-5bb330eb7f38.jpg?1594737152",
    oracleText: "Whenever you cast a spell that's white, blue, black, or red, put a +1/+1 counter on this creature.",
    colors: ["G"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Dryad"],
    power: "1",
    toughness: "1",
    keywords: [],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastSpell,
            condition: (state: any, event: any, triggerDef: any) => {
                const card = event.data?.card;
                if (!card) return false;
                const colors = card.definition?.colors || [];
                return event.playerId === triggerDef.controllerId &&
                    (colors.includes('W') || colors.includes('U') ||
                        colors.includes('B') || colors.includes('R'));
            },
            effects: [{
                type: EffectType.AddCounters,
                counterType: 'p1p1',
                amount: 1,
                targetMapping: TargetMapping.Self
            }]
        }
    ]

};



