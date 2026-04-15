import { CardDefinition, AbilityType, EffectType, TargetMapping } from '@shared/engine_types';

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

    preparedFace: {
        name: "Seething Song",
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
