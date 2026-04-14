import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType, DurationType } from "@shared/engine_types";

export const ChandrasPyreling: Record<string, ImplementableCard> = {
    "Chandra's Pyreling": {
        name: "Chandra's Pyreling",
        manaCost: "{1}{R}",
        oracleText: "Whenever an opponent is dealt noncombat damage, Chandra's Pyreling gets +1/+0 and gains double strike until end of turn. (This ability triggers for each time they're dealt noncombat damage.)",
        colors: ["red"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Elemental", "Lizard"],
        power: "1",
        toughness: "3",
        keywords: [],
        abilities: [
            {
                id: "chandras_pyreling_trigger",
                type: AbilityType.Triggered,
                activeZone: ZoneRequirement.Battlefield,
                    eventMatch: "ON_NONCOMBAT_DAMAGE_OPPONENT",
                condition: (state: any, event: any, source: any) => {
                    // event.targetId is the player who was dealt damage.
                    // We trigger if that player is an opponent of Pyreling's controller.
                    return event.targetId !== source.controllerId;
                },
                effects: [
                    {
                        type: EffectType.ApplyContinuousEffect,
                        powerModifier: 1,
                        abilitiesToAdd: ["Double Strike"],
                        duration: { type: DurationType.UntilEndOfTurn },
                        targetMapping: "SELF"
                    }
                ]
            }
        ]
    }
};


