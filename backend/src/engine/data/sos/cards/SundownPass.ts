import { AbilityType, CardDefinition, CostType, EffectType } from '@shared/engine_types';
export const SundownPass: CardDefinition = {
    name: "Sundown Pass",
    manaCost: "",
    colors: [],
    types: ["Land"],
    subtypes: [],
    keywords: [],
    oracleText: "This land enters tapped unless you control two or more other lands.\n{T}: Add {R} or {W}.",
    entersTappedCondition: "OTHER_LANDS_LE:1",
    abilities: [
        {
            type: AbilityType.Activated,
            id: "{T}: Add {R} or {W}.",
            costs: [{ type: CostType.Tap }],
            isManaAbility: true,
            effects: [
                {
                    type: EffectType.Choice,
                    optional: true,
                    label: "Choose a color",
                    choices: [
                        { label: '{R}', effects: [{ type: EffectType.AddMana, manaType: 'R' }] },
                        { label: '{W}', effects: [{ type: EffectType.AddMana, manaType: 'W' }] }
                    ]
                }
            ]
        }
    ],
    scryfall_id: "b34000e9-ff20-4fb4-9d0b-03a172a92457",
    image_url: "https://cards.scryfall.io/normal/front/b/3/b34000e9-ff20-4fb4-9d0b-03a172a92457.jpg?1775938845",
    rarity: "rare"
};

