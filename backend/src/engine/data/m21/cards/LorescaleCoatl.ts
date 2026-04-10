import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const LorescaleCoatl: Record<string, ImplementableCard> = {
    "Lorescale Coatl": {
        name: "Lorescale Coatl",
        manaCost: "{1}{G}{U}",
        oracleText: "Whenever you draw a card, put a +1/+1 counter on this creature.",
        colors: ["green", "blue"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Snake"],
        power: "2",
        toughness: "2",
        keywords: [],
        abilities: [
            {
                id: "lorescale_coatl_draw_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_DRAW',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.playerId === source.controllerId,
                effects: [{
                    type: EffectType.AddCounters,
                    value: '+1/+1',
                    amount: 1,
                    targetMapping: 'SELF'
                }],
                oracleText: "Whenever you draw a card, put a +1/+1 counter on this creature."
            }
        ]
    }
};
