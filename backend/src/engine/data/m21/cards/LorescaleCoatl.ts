import { AbilityType, Zone, CardDefinition, EffectType, TargetMapping, TriggerEvent } from "@shared/engine_types";

export const LorescaleCoatl: CardDefinition = {

    name: "Lorescale Coatl",
    manaCost: "{1}{G}{U}",
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
            activeZone: Zone.Battlefield,
            condition: (state: any, event: any, source: any) => event.playerId === source.controllerId,
            effects: [{
                type: EffectType.AddCounters,
                counterType: 'p1p1',
                amount: 1,
                targetMapping: TargetMapping.Self
            }],

        }
    ]

};


