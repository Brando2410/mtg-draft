import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const HistorianofZhalfir: Record<string, ImplementableCard> = {
    "Historian of Zhalfir": {
        name: "Historian of Zhalfir",
        manaCost: "{2}{U}{U}",
        oracleText: "Whenever Historian of Zhalfir attacks, if you control a Teferi planeswalker, draw a card.",
        colors: ["blue"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Human", "Wizard"],
        power: "3",
        toughness: "3",
        keywords: [],
        abilities: [
            {
                id: "historian_of_zhalfir_attack_trigger",
                type: AbilityType.Triggered,
                triggerEvent: "ON_ATTACK",
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => {
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
                    targetMapping: "CONTROLLER"
                }],
                oracleText: "Whenever Historian of Zhalfir attacks, if you control a Teferi planeswalker, draw a card."
            }
        ]
    }
};
