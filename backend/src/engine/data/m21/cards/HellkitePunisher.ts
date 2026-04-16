import { AbilityType, Zone, CardDefinition, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const HellkitePunisher: CardDefinition = {
        name: "Hellkite Punisher",
        manaCost: "{5}{R}{R}",
        oracleText: "Flying\n{R}: This creature gets +1/+0 until end of turn.",
        colors: ["red"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Dragon"],
        power: "6",
        toughness: "6",
        keywords: ["Flying"],
        abilities: [
            {
                id: "hellkite_punisher_firebreathing",
                type: AbilityType.Activated,
                activeZone: Zone.Battlefield,
                costs: [{ type: 'Mana', value: '{R}' }],
                effects: [{
                    type: EffectType.ApplyContinuousEffect,
                    duration: 'UNTIL_END_OF_TURN',
                    powerModifier: 1,
                    layer: 7,
                    targetMapping: 'SELF'
                }],
                oracleText: "{R}: Hellkite Punisher gets +1/+0 until end of turn."
            }
        ]
    };

