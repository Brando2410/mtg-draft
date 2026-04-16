import {AbilityType, Zone, CardDefinition, EffectType, GameEvent, GameObject, TargetType, DurationType} from "@shared/engine_types";

export const FetidImp: CardDefinition = {
        name: "Fetid Imp",
        manaCost: "{1}{B}",
        oracleText: "Flying\n{B}: This creature gains deathtouch until end of turn. (Any amount of damage it deals to a creature is enough to destroy it.)",
        colors: ["black"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Imp"],
        power: "1",
        toughness: "2",
        keywords: ["Flying"],
        abilities: [
            {
                id: "fetid_imp_deathtouch",
                type: AbilityType.Activated,
                activeZone: Zone.Battlefield,
                costs: [
                    { type: 'Mana', value: "{B}" }
                ],
                effects: [
                    {
                        type: EffectType.ApplyContinuousEffect,
                        abilitiesToAdd: ["Deathtouch"],
                        duration: {
                            type: DurationType.UntilEndOfTurn
                        },
                        targetMapping: "SELF"
                    }
                ],
                oracleText: "{B}: Fetid Imp gains deathtouch until end of turn."
            }
        ]
    };

