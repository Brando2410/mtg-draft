import { AbilityType, TriggerEvent, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const DeathbloomThallid: Record<string, ImplementableCard> = {
    "Deathbloom Thallid": {
        name: "Deathbloom Thallid",
        manaCost: "{2}{B}",
        oracleText: "When Deathbloom Thallid dies, create a 1/1 green Saproling creature token.",
        colors: ["black"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Zombie", "Fungus"],
        power: "3",
        toughness: "2",
        keywords: [],
        abilities: [
            {
                id: "deathbloom_thallid_death",
                type: AbilityType.Triggered,
                activeZone: ZoneRequirement.Battlefield,
                    eventMatch: TriggerEvent.Death,
                effects: [
                    {
                        type: EffectType.CreateToken,
                        amount: 1,
                        targetMapping: "CONTROLLER",
                        tokenBlueprint: {
                            name: "Saproling",
                            colors: ["green"],
                            types: ["Creature"],
                            subtypes: ["Saproling"],
                            power: "1",
                            toughness: "1"
                        }
                    }
                ]
            }
        ]
    }
};


