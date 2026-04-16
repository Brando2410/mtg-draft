import {AbilityType, Zone, CardDefinition, EffectType, GameEvent, GameObject, TargetType, RestrictionType} from "@shared/engine_types";

export const CanopyStalker: CardDefinition = {
        name: "Canopy Stalker",
        manaCost: "{3}{G}",
        oracleText: "Canopy Stalker must be blocked if able.\nWhen Canopy Stalker dies, you gain 1 life for each creature that died this turn.",
        colors: ["green"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Cat"],
        power: "4",
        toughness: "2",
        keywords: [],
        abilities: [
            {
                id: "canopy_stalker_must_be_blocked",
                type: AbilityType.Static,
                activeZone: Zone.Battlefield,
                restrictions: [
                    {
                        type: RestrictionType.MustBeBlocked,
                        targetMapping: "SELF"
                    }
                ] as any // Bypass linting for targetMapping which is handled in RegistryProcessor
            },
            {
                id: "canopy_stalker_death",
                type: AbilityType.Triggered,
                activeZone: Zone.Battlefield,
                    eventMatch: "ON_DEATH",
                effects: [
                    {
                        type: EffectType.GainLife,
                        amount: (state: any) => {
                            return state.turnState.creaturesDiedThisTurn.length;
                        },
                        targetMapping: "CONTROLLER"
                    }
                ]
            }
        ]
    };



