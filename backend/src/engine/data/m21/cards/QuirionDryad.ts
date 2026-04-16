import { AbilityType, Zone, CardDefinition, EffectType, TriggerEvent, TargetMapping } from "@shared/engine_types";

export const QuirionDryad: CardDefinition = {

    name: "Quirion Dryad",
    manaCost: "{1}{G}",
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
            id: "quirion_dryad_trigger",
            type: AbilityType.Triggered,
            activeZone: Zone.Battlefield,
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



