import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const MassacreWurm: Record<string, ImplementableCard> = {
    "Massacre Wurm": {
        name: "Massacre Wurm",
        manaCost: "{3}{B}{B}{B}",
        oracleText: "When this creature enters, creatures your opponents control get -2/-2 until end of turn.\nWhenever a creature an opponent controls dies, that player loses 2 life.",
        colors: ["black"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Phyrexian", "Wurm"],
        power: "6",
        toughness: "5",
        keywords: [],
        abilities: [
            {
                id: "massacre_wurm_etb",
                type: AbilityType.Triggered,
                    eventMatch: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                effects: [{
                    type: EffectType.ApplyContinuousEffect,
                    duration: 'UNTIL_END_OF_TURN',
                    layer: 7,
                    powerModifier: -2,
                    toughnessModifier: -2,
                    targetMapping: 'ALL_CREATURES_OPPONENTS_CONTROL'
                }]
            },
            {
                id: "massacre_wurm_death_trigger",
                type: AbilityType.Triggered,
                    eventMatch: 'ON_DEATH',
                activeZone: ZoneRequirement.Battlefield,
                condition: 'EVENT_OBJECT_MATCHES:creature,opponentcontrol',
                effects: [{
                    type: EffectType.LoseLife,
                    amount: 2,
                    targetMapping: 'EVENT_OBJECT_CONTROLLER'
                }]
            }
        ]
    }
};


