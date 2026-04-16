import { AbilityType, CardDefinition, EffectType, GameEvent, GameObject, TargetType, Zone } from '@shared/engine_types';

export const GloriousAnthem: CardDefinition = {
        name: "Glorious Anthem",
        manaCost: "{1}{W}{W}",
        oracleText: "Creatures you control get +1/+1.",
        colors: ["white"],
        supertypes: [],
        types: ["Enchantment"],
        subtypes: [],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "glorious_anthem_static",
                type: AbilityType.Static,
                activeZone: Zone.Battlefield,
                effects: [{ type: 'ApplyContinuousEffect', powerModifier: 1, toughnessModifier: 1, layer: 7, targetMapping: 'ALL_CREATURES_YOU_CONTROL' }]
            }
        ]
    };


