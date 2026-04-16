import { AbilityType, CardDefinition, CostType, EffectType, Zone } from '@shared/engine_types';
    export const EternalStudent: CardDefinition = {
    name: "Eternal Student",
    manaCost: "{3}{B}",
    colors: [
        "B"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Zombie",
        "Warlock"
    ],
    keywords: ["Flying"],
    oracleText: "{1}{B}, Exile this card from your graveyard: Create two 1/1 white and black Inkling creature tokens with flying.",
    abilities: [
        {
            type: AbilityType.Activated,
            manaCost: "{1}{B}",
            costs: [{ type: CostType.ExileSelf }],
            zone: Zone.Graveyard,
            effects: [
                {
                    type: EffectType.CreateToken,
                    amount: 2,
                    tokenBlueprint: {
                        name: "Inkling",
                        colors: ["W", "B"],
                        types: ["Creature"],
                        subtypes: ["Inkling"],
                        power: "1",
                        toughness: "1",
                        image_url: "https://cards.scryfall.io/png/front/c/9/c9deae5c-80d4-4701-b425-91853b7ee03b.png?1682693898"
                    }
                }
            ]
        }
    ],
    power: "4",
    toughness: "2"
};
    