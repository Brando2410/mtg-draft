import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const HuntersEdge: Record<string, ImplementableCard> = {
    "Hunter's Edge": {
        name: "Hunter's Edge",
        manaCost: "{3}{G}",
        oracleText: "Put a +1/+1 counter on target creature you control. Then that creature deals damage equal to its power to target creature you don't control.",
        colors: ["green"],
        supertypes: [],
        types: ["Sorcery"],
        subtypes: [],
        power: "",
        toughness: "",
        keywords: [],
        abilities: [
            {
                id: "hunters_edge_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Hand,
                targetDefinition: { 
                    type: 'Permanent', 
                    count: 2, 
                    perTargetRestrictions: [
                        ['Creature', 'YouControl'],
                        ['Creature', 'OpponentControl']
                    ] 
                },
                effects: [
                    {
                        type: EffectType.AddCounters,
                        amount: 1,
                        value: '+1/+1',
                        targetMapping: 'TARGET_1'
                    },
                    {
                        type: EffectType.DealDamage,
                        amount: 'TARGET_1_POWER',
                        damageSourceMapping: 'TARGET_1',
                        targetMapping: 'TARGET_2'
                    }
                ]
            }
        ]
    }
};
