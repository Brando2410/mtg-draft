import { AbilityType, Zone, EffectType, TargetType, CardDefinition, TargetMapping } from "@shared/engine_types";

export const LegionsJudgment: CardDefinition = {

    name: "Legion's Judgment",
    manaCost: "{2}{W}",
    oracleText: "Destroy target creature with power 4 or greater.",
    colors: ["W"],
    supertypes: [],
    types: ["Sorcery"],
    subtypes: [],
    keywords: [],
    abilities: [
        {
            type: AbilityType.Spell,
            activeZone: Zone.Hand,
            targetDefinition: {
                type: TargetType.Creature,
                count: 1,
                minCount: 1,
                restrictions: ["power >= 4"]
            },
            effects: [{
                type: EffectType.Destroy,
                targetMapping: TargetMapping.Target1
            }],

        }
    ]
};
