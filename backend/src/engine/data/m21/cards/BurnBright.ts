import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const BurnBright: Record<string, ImplementableCard> = {
    "Burn Bright": {
        name: "Burn Bright",
        manaCost: "{2}{R}",
        oracleText: "Creatures you control get +2/+0 until end of turn.",
        colors: ["red"],
        supertypes: [],
        types: ["Instant"],
        subtypes: [],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "burn_bright_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                effects: [{ type: 'ApplyContinuousEffect', powerModifier: 2, toughnessModifier: 0, duration: 'UNTIL_END_OF_TURN', layer: 7, targetMapping: 'ALL_CREATURES_YOU_CONTROL' }]
            }
        ]
    }
};
