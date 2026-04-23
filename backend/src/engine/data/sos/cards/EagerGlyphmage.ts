import { AbilityType, CardDefinition, EffectType, TriggerEvent } from '@shared/engine_types';
export const EagerGlyphmage: CardDefinition = {
    name: "Eager Glyphmage",
    manaCost: "{3}{W}",
    scryfall_id: "bf736de9-9bc4-49df-ae60-672ed4f83f32",
    rarity: "common",
    image_url: "https://cards.scryfall.io/normal/front/b/f/bf736de9-9bc4-49df-ae60-672ed4f83f32.jpg?1775936986",
    colors: ["W"],
    types: ["Creature"],
    subtypes: ["Cat", "Cleric"],
    keywords: ['Flying'],
    power: "3",
    toughness: "3",
    oracleText: "When this creature enters, create a 1/1 white and black Inkling creature token with flying.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.CreateToken,
                    tokenBlueprint: {
                        name: 'Inkling',
                        colors: ['W', 'B'],
                        types: ['Creature'],
                        subtypes: ['Inkling'],
                        keywords: ['Flying'],
                        power: 1,
                        toughness: 1,
                        image_url: "https://cards.scryfall.io/normal/front/b/a/bab52920-9d67-4cd4-9015-6e645ff9764f.jpg?1775828515",

                    }
                }
            ]
        }
    ]
};

