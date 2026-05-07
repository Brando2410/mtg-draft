import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, Zone } from "@shared/engine_types";

export const VisionarysDance: CardDefinition = {
    name: "Visionary's Dance",
    manaCost: "{5}{U}{R}",
    scryfall_id: "846a0e79-a530-429e-8f7f-4b87f1b0156e",
    rarity: "uncommon",
    image_url: "https://cards.scryfall.io/normal/front/8/4/846a0e79-a530-429e-8f7f-4b87f1b0156e.jpg?1776000377",
    colors: ["U", "R"],
    types: ["Sorcery"],
    oracleText: "Create two 3/3 blue and red Elemental creature tokens with flying.\n{2}, Discard this card: Look at the top two cards of your library. Put one of them into your hand and the other into your graveyard.",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.CreateToken,
                    amount: 2,
                    tokenBlueprint: {
                        name: "Elemental",
                        colors: ["U", "R"],
                        types: ["Creature"],
                        subtypes: ["Elemental"],
                        power: 3,
                        toughness: 3,
                        keywords: ["Flying"],
                        image_url: 'https://cards.scryfall.io/normal/front/3/d/3d0b9b88-705e-4df0-8a93-3e240b81355b.jpg?1682693891'
                    }
                }
            ]
        },
        {
            type: AbilityType.Activated,
            activeZone: Zone.Hand,
            costs: [
                { type: CostType.Mana, value: "{2}" },
                { type: CostType.Discard, restrictions: ['SELF'] }
            ],
            effects: [
                {
                    type: EffectType.LookAtTopAndPick,
                    amount: 2,
                    pickCount: 1,
                    zone: Zone.Hand,
                    remainderZone: Zone.Graveyard,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};
