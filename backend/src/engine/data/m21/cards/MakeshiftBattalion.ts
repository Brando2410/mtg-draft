import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from "@shared/engine_types";

export const MakeshiftBattalion: CardDefinition = {
    name: "Makeshift Battalion",
    manaCost: "{2}{W}",
    scryfall_id: "31a500e6-01f5-4a3a-8839-68b9b515e919",
    image_url: "https://cards.scryfall.io/normal/front/3/1/31a500e6-01f5-4a3a-8839-68b9b515e919.jpg?1594735061",
    oracleText: "Whenever this creature and at least two other creatures attack, put a +1/+1 counter on this creature.",
    colors: ["W"],
    types: ["Creature"],
    subtypes: ["Human", "Soldier"],
    power: "3",
    toughness: "2",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Attack,
            condition: 'IS_SOURCE && ATTACKING_WITH_2_OR_MORE_OTHER_CREATURES',
            effects: [{
                type: EffectType.AddCounters,
                counterType: '+1/+1',
                amount: 1,
                targetMapping: TargetMapping.Self
            }]
        }
    ]
};
