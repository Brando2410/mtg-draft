import { AbilityType, Zone, CardDefinition, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const ContainmentPriest: CardDefinition = {
        name: "Containment Priest",
        manaCost: "{1}{W}",
        oracleText: "Flash\nIf a nontoken creature would enter the battlefield and it wasn’t cast, exile it instead.",
        colors: ["white"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Human", "Cleric"],
        power: "2",
        toughness: "2",
        keywords: ["Flash"],
        abilities: [
            {
                id: "containment_priest_replacement",
                type: AbilityType.Replacement,
                activeZone: Zone.Battlefield,
                oracleText: "If a nontoken creature would enter the battlefield and it wasn't cast, exile it instead."
            }
        ]
    };

