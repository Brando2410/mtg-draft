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
    ]
};
