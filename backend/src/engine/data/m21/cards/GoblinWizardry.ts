import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const GoblinWizardry: Record<string, ImplementableCard> = {
    "Goblin Wizardry": {
        name: "Goblin Wizardry",
        manaCost: "{3}{R}",
        oracleText: "Create two 1/1 red Goblin Wizard creature tokens with prowess. (Whenever you cast a noncreature spell, they get +1/+1 until end of turn.)",
        colors: [],
        supertypes: [],
        types: [],
        subtypes: [],
        power: "",
        toughness: "",
        keywords: [],
        abilities: []
    }
};
