import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const AlpineWatchdog: Record<string, ImplementableCard> = {
    "Alpine Watchdog": {
        name: "Alpine Watchdog",
        manaCost: "{1}{W}",
        oracleText: "Vigilance (Attacking doesn't cause this creature to tap.)",
        colors: ["white"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Dog"],
        power: "2",
        toughness: "2",
        keywords: ["Vigilance"],
        abilities: []
    }
};
