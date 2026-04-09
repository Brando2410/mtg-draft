import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const ContainmentPriest: Record<string, ImplementableCard> = {
    "Containment Priest": {
        name: "Containment Priest",
        manaCost: "{1}{W}",
        oracleText: "Flash\nIf a nontoken creature would enter and it wasn't cast, exile it instead.",
        colors: ["white"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Human","Cleric"],
        power: "2",
        toughness: "2",
        keywords: [],
        abilities: [
            {
                id: "containment_priest_entry_replacement",
                type: 'Replacement',
                activeZone: ZoneRequirement.Battlefield,
                oracleText: "If a nontoken creature would enter the battlefield and it wasn't cast, exile it instead."
            }
        ]
    }
};
