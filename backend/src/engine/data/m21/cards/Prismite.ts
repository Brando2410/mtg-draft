import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const Prismite: Record<string, ImplementableCard> = {
    "Prismite": {
        name: "Prismite",
        manaCost: "{2}",
        oracleText: "{2}: Add one mana of any color.",
        colors: [],
        supertypes: [],
        types: ["Artifact", "Creature"],
        subtypes: ["Golem"],
        power: "2",
        toughness: "1",
        keywords: [],
        abilities: [
            {
                id: "prismite_mana",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Mana', value: '{2}' }],
                isManaAbility: true,
                effects: [{
                    type: EffectType.AddMana,
                    value: 'any',
                    amount: 1,
                    targetMapping: 'CONTROLLER'
                }]
            }
        ]
    }
};
