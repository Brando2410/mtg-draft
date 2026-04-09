import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const QuirionDryad: Record<string, ImplementableCard> = {
    "Quirion Dryad": {
        name: "Quirion Dryad",
        manaCost: "{1}{G}",
        oracleText: "Whenever you cast a spell that's white, blue, black, or red, put a +1/+1 counter on this creature.",
        colors: ["green"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Dryad"],
        power: "1",
        toughness: "1",
        keywords: [],
        abilities: [
            {
                id: "quirion_dryad_trigger",
                type: AbilityType.Triggered,
                activeZone: ZoneRequirement.Battlefield,
                triggerEvent: 'ON_CAST_SPELL',
                triggerCondition: (state: any, event: any, triggerDef: any) => {
                    const card = event.data?.card;
                    if (!card) return false;
                    const colors = card.definition?.colors || [];
                    return event.playerId === triggerDef.controllerId && 
                        (colors.includes('white') || colors.includes('blue') || 
                         colors.includes('black') || colors.includes('red'));
                },
                effects: [{
                    type: EffectType.AddCounters,
                    value: '+1/+1',
                    amount: 1,
                    targetMapping: 'SELF'
                }]
            }
        ]
    }
};
