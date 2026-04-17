import { AbilityType, EffectType, CardDefinition, TargetMapping, TriggerEvent } from "@shared/engine_types";

export const MakeshiftBattalion: CardDefinition = {

    name: "Makeshift Battalion",
    manaCost: "{2}{W}",
    scryfall_id: "31a500e6-01f5-4a3a-8839-68b9b515e919",
    image_url: "https://cards.scryfall.io/normal/front/3/1/31a500e6-01f5-4a3a-8839-68b9b515e919.jpg?1594735061",
    oracleText: "Whenever this creature and at least two other creatures attack, put a +1/+1 counter on this creature.",
    colors: ["W"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Human", "Soldier"],
    power: "3",
    toughness: "2",
    keywords: [],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Attack,
            condition: (state: any, event: any, source: any) => {
                return event.sourceId === source.sourceId &&
                    (state.combat?.attackers?.length || 0) >= 3;
            },
            effects: [{
                type: EffectType.AddCounters,
                counterType: 'p1p1',
                amount: 1,
                targetMapping: TargetMapping.Self
            }],
        }
    ]

};



