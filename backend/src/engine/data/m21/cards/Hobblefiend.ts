import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const Hobblefiend: Record<string, ImplementableCard> = {
    "Hobblefiend": {
        name: "Hobblefiend",
        manaCost: "{1}{R}",
        oracleText: "Trample\n{1}, Sacrifice another creature: Put a +1/+1 counter on Hobblefiend. Activate only as a sorcery.",
        colors: ["red"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Elemental", "Devil"],
        power: "2",
        toughness: "1",
        keywords: ["Trample"],
        abilities: [
            {
                id: "hobblefiend_sacrifice",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [
                    { type: 'Mana', value: '{1}' },
                    { type: 'Sacrifice', restrictions: ['creature', 'other'] }
                ],
                effects: [{
                    type: EffectType.AddCounters,
                    counterType: 'p1p1',
                    amount: 1,
                    targetMapping: 'SELF'
                }],
                oracleText: "{1}, Sacrifice another creature: Put a +1/+1 counter on Hobblefiend. Activate only as a sorcery."
            }
        ]
    }
};
