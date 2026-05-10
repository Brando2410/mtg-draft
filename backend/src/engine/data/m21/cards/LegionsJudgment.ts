import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType } from "@shared/engine_types";

export const LegionsJudgment: CardDefinition = {
    name: "Legion's Judgment",
    manaCost: "{2}{W}",

    oracleText: "Destroy target creature with power 4 or greater.",
    colors: ["W"],
    types: ["Sorcery"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                type: TargetType.Creature,
                count: 1,
                restrictions: [Restriction.Power4OrGreater]
            }],
            effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.Target1 }]
        }
    ],
    scryfall_id: "032f6c5a-8d88-4a55-a54b-28df42d801e1",
    image_url: "https://cards.scryfall.io/normal/front/0/3/032f6c5a-8d88-4a55-a54b-28df42d801e1.jpg?1594735024",
    rarity: "common"
};

