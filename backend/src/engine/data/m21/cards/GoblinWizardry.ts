import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const GoblinWizardry: Record<string, ImplementableCard> = {
    "Goblin Wizardry": {
        name: "Goblin Wizardry",
        manaCost: "{3}{R}",
        oracleText: "Create two 1/1 red Goblin Wizard creature tokens with prowess. (Whenever you cast a noncreature spell, they get +1/+1 until end of turn.)",
        colors: ["red"],
        supertypes: [],
        types: ["Instant"],
        subtypes: [],
        power: "",
        toughness: "",
        keywords: [],
        abilities: [
            {
                id: "goblin_wizardry_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Hand,
                effects: [{
                    type: EffectType.CreateToken,
                    amount: 2,
                    targetMapping: "CONTROLLER",
                    tokenBlueprint: {
                        name: "Goblin Wizard",
                        power: "1",
                        toughness: "1",
                        colors: ["red"],
                        types: ["Creature"],
                        subtypes: ["Goblin", "Wizard"],
                        keywords: ["Prowess"],
                        oracleText: "Prowess"
                    }
                }],
                oracleText: "Create two 1/1 red Goblin Wizard creature tokens with prowess."
            }
        ]
    }
};
