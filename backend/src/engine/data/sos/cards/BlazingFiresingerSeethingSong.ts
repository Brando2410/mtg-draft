import { AbilityType, CardDefinition, EffectType, TargetMapping } from '@shared/engine_types';

export const BlazingFiresingerSeethingSong: CardDefinition = {
    name: "Blazing Firesinger",
    manaCost: "{2}{R}",
    colors: ["R"],
    types: ["Creature"],
    subtypes: ["Dwarf", "Bard"],
    power: "2",
    toughness: "3",
    keywords: ["Prepared"],
    oracleText: "This creature enters prepared.",
    entersPrepared: true,
    image_url: "https://cards.scryfall.io/png/front/3/b/3ba971e7-0b7a-4750-896f-7cf063e66b2a.png?1775937691",

    preparedFace: {
        name: "Seething Song",
        image_url: "https://cards.scryfall.io/png/front/f/4/f493ce26-005c-4ddc-80f0-47bea4fd013a.png?1764118123",
        manaCost: "{2}{R}",
        colors: ["R"],
        types: ["Instant"],
        oracleText: "Add {R}{R}{R}{R}{R}.",
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [
                    {
                        type: EffectType.AddMana,
                        manaType: 'R',
                        amount: 5
                    }
                ]
            }
        ]
    }
};

