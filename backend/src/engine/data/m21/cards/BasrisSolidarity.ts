import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const BasrisSolidarity: Record<string, ImplementableCard> = {
    "Basri's Solidarity": {
        name: "Basri's Solidarity",
        manaCost: "{1}{W}",
        oracleText: "Put a +1/+1 counter on each creature you control.",
        colors: ["white"],
        supertypes: [],
        types: ["Sorcery"],
        subtypes: [],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "basri_solidarity_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                effects: [{ type: 'AddCounters', amount: 1, value: '+1/+1', targetMapping: 'ALL_CREATURES_YOU_CONTROL' }]
            }
        ]
    }
};
