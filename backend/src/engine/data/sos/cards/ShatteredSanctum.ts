import { AbilityType, CardDefinition, CostType, EffectType } from '@shared/engine_types';

export const ShatteredSanctum: CardDefinition = {
    name: "Shattered Sanctum",
    manaCost: "",
    colors: [],
    types: ["Land"],
    subtypes: [],
    keywords: [],
    oracleText: "This land enters tapped unless you control two or more other lands.\n{T}: Add {W} or {B}.",
    entersTappedCondition: "OTHER_LANDS_LE:1",
    abilities: [
        {
            type: AbilityType.Activated,
            id: "{T}: Add {W} or {B}.",
            costs: [{ type: CostType.Tap }],
            isManaAbility: true,
            effects: [
                {
                    type: EffectType.Choice,
                    label: "Choose a color",
                    choices: [
                        { label: '{W}', effects: [{ type: EffectType.AddMana, manaType: 'W' }] },
                        { label: '{B}', effects: [{ type: EffectType.AddMana, manaType: 'B' }] }
                    ]
                }
            ]
        }
    ],
    scryfall_id: "5aa0c810-3b7d-4661-979e-e84fb327742d",
    image_url: "https://cards.scryfall.io/normal/front/5/a/5aa0c810-3b7d-4661-979e-e84fb327742d.jpg?1775938816",
    rarity: "rare"
};

