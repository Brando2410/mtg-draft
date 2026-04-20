import { AbilityType, CardDefinition, EffectType, TargetMapping } from "@shared/engine_types";

export const GoblinWizardry: CardDefinition = {
    name: "Goblin Wizardry",
    manaCost: "{3}{R}",
    scryfall_id: "d7ac8bdd-851f-449d-a108-70578eabf254",
    image_url: "https://cards.scryfall.io/normal/front/d/7/d7ac8bdd-851f-449d-a108-70578eabf254.jpg?1594736662",
    oracleText: "Create two 1/1 red Goblin Wizard creature tokens with prowess. (Whenever you cast a noncreature spell, they get +1/+1 until end of turn.)",
    colors: ["R"],
    types: ["Instant"],
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [{
                type: EffectType.CreateToken,
                amount: 2,
                targetMapping: TargetMapping.Controller,
                definition: {
                    name: "Goblin Wizard",
                    power: "1",
                    toughness: "1",
                    colors: ["R"],
                    types: ["Creature"],
                    subtypes: ["Goblin", "Wizard"],
                    keywords: ["Prowess"],
                    oracleText: "Prowess",
                    image_url: 'https://cards.scryfall.io/large/front/c/c/cc6c692d-022f-4dc4-8f43-1678619d8213.jpg?1594733618'
                }
            }]
        }
    ]
};
