import { AbilityType, Zone, CardDefinition, EffectType, TargetMapping, TriggerEvent } from "@shared/engine_types";

export const HistorianofZhalfir: CardDefinition = {
    name: "Historian of Zhalfir",
    manaCost: "{2}{U}{U}",
    oracleText: "Whenever Historian of Zhalfir attacks, if you control a Teferi planeswalker, draw a card.",
    colors: ["U"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Human", "Wizard"],
    power: "3",
    toughness: "3",
    keywords: [],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Attack,
            condition: (state: any, event: any, source: any) => {
                if (event.sourceId !== source.sourceId) return false;
                // Rule 102.1: Teferi planeswalker means a planeswalker with the "Teferi" subtype.
                return state.battlefield.some((o: any) =>
                    o.controllerId === source.controllerId &&
                    o.definition.types.some((t: string) => t.toLowerCase() === 'planeswalker') &&
                    o.definition.subtypes.some((s: string) => s.toLowerCase() === 'teferi')
                );
            },
            effects: [{
                type: EffectType.DrawCards,
                amount: 1,
                targetMapping: TargetMapping.Controller
            }],
        }
    ]
};



