import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const RangersGuile: Record<string, ImplementableCard> = {
    "Ranger's Guile": {
        name: "Ranger's Guile",
        manaCost: "{G}",
        oracleText: "Target creature you control gets +1/+1 and gains hexproof until end of turn. (It can't be the target of spells or abilities your opponents control.)",
        colors: ["green"],
        supertypes: [],
        types: ["Instant"],
        subtypes: [],
        power: "",
        toughness: "",
        keywords: [],
        abilities: [
            {
                id: "rangers_guile_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Hand,
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature', 'Controller'] },
                effects: [
                    {
                        type: EffectType.ApplyContinuousEffect,
                        layer: 7,
                        powerModifier: 1,
                        toughnessModifier: 1,
                        duration: 'UntilEndOfTurn',
                        targetMapping: 'TARGET_1'
                    },
                    {
                        type: EffectType.ApplyContinuousEffect,
                        layer: 6,
                        abilitiesToAdd: ['Hexproof'],
                        duration: 'UntilEndOfTurn',
                        targetMapping: 'TARGET_1'
                    }
                ]
            }
        ]
    }
};
