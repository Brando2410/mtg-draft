import { AbilityType, Zone, EffectType, CardDefinition, TargetMapping, TriggerEvent } from "@shared/engine_types";

export const MakeshiftBattalion: CardDefinition = {

    name: "Makeshift Battalion",
    manaCost: "{2}{W}",
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
            activeZone: Zone.Battlefield,
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



