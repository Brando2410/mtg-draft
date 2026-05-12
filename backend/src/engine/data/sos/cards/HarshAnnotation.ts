import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
export const HarshAnnotation: CardDefinition = {
    name: "Harsh Annotation",
    manaCost: "{1}{W}",
    colors: ["W"],
    types: ["Instant"],
    subtypes: [],
    keywords: ["Flying"],
    oracleText: "Destroy target creature. Its controller creates a 1/1 white and black Inkling creature token with flying.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                type: TargetType.Creature,
                count: 1
            }],
            effects: [
                {
                    type: EffectType.Destroy,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.CreateToken,
                    amount: 1,
                    tokenBlueprint: {
                        name: "Inkling",
                        colors: ["W", "B"],
                        types: ["Creature"],
                        subtypes: ["Inkling"],
                        power: "1",
                        toughness: "1",
                        keywords: ["Flying"],
                        image_url: "https://cards.scryfall.io/normal/front/4/3/43e9f729-abaf-4000-8df5-fa46d59eff9e.jpg?1775828361"
                    },
                    targetMapping: TargetMapping.Target1Controller
                }
            ]
        }
    ],
    scryfall_id: "e07a8fc7-c11c-4469-a31d-0abf40e57bbf",
    image_url: "https://cards.scryfall.io/normal/front/e/0/e07a8fc7-c11c-4469-a31d-0abf40e57bbf.jpg?1775937033",
    rarity: "uncommon"
};

