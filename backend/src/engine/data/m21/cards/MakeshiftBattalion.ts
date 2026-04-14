import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const MakeshiftBattalion: Record<string, ImplementableCard> = {
    "Makeshift Battalion": {
        name: "Makeshift Battalion",
        manaCost: "{2}{W}",
        oracleText: "Whenever this creature and at least two other creatures attack, put a +1/+1 counter on this creature.",
        colors: ["white"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Human", "Soldier"],
        power: "3",
        toughness: "2",
        keywords: [],
        abilities: [
            {
                id: "makeshift_battalion_trigger",
                type: AbilityType.Triggered,
                    eventMatch: 'ON_ATTACK',
                activeZone: ZoneRequirement.Battlefield,
                condition: (state: any, event: any, source: any) => {
                    return event.sourceId === source.sourceId && 
                           (state.combat?.attackers?.length || 0) >= 3;
                },
                effects: [{
                    type: EffectType.AddCounters,
                    value: '+1/+1',
                    amount: 1,
                    targetMapping: 'SELF'
                }],
                oracleText: "Whenever this creature and at least two other creatures attack, put a +1/+1 counter on this creature."
            }
        ]
    }
};


