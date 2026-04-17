import { AbilityType, CardDefinition, EffectType, TargetType, TargetMapping } from "@shared/engine_types";

export const InvigoratingSurge: CardDefinition = {
    name: "Invigorating Surge",
    manaCost: "{2}{G}",
    scryfall_id: "531e1fc0-a3aa-4b57-87b2-79a31af5c922",
    image_url: "https://cards.scryfall.io/normal/front/5/3/531e1fc0-a3aa-4b57-87b2-79a31af5c922.jpg?1594737063",
    oracleText: "Put a +1/+1 counter on target creature you control, then double the number of +1/+1 counters on that creature.",
    colors: ["G"],
    types: ["Instant"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Creature,
                restrictions: [
                { type: 'Type', value: 'youcontrol' }
            ]
            },
            effects: [
                {
                    type: EffectType.AddCounters,
                    counterType: "+1/+1",
                    amount: 1,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.DoubleCounters,
                    counterType: "+1/+1",
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
