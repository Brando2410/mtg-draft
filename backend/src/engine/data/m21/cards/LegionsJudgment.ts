import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const LegionsJudgment: Record<string, ImplementableCard> = {
    "Legion's Judgment": {
        name: "Legion's Judgment",
        manaCost: "{2}{W}",
        oracleText: "Destroy target creature with power 4 or greater.",
        colors: ["white"],
        supertypes: [],
        types: ["Sorcery"],
        subtypes: [],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "legions_judgment_spell",
                type: AbilityType.Spell,
                activeZone: Zone.Hand,
                targetDefinition: {
                    type: TargetType.Permanent,
                    count: 1,
                    minCount: 1,
                    restrictions: ["creature", "power >= 4"]
                },
                effects: [{
                    type: EffectType.Destroy,
                    targetMapping: "TARGET_1"
                }],
                oracleText: "Destroy target creature with power 4 or greater."
            }
        ]
    }
};
