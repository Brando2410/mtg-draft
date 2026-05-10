import { AbilityType, CardDefinition, CostType, EffectType } from '@shared/engine_types';
export const StormcarvedCoast: CardDefinition = {
    name: "Stormcarved Coast",
    manaCost: "",
    colors: [],
    types: ["Land"],
    subtypes: [],
    keywords: [],
    oracleText: "This land enters tapped unless you control two or more other lands.\n{T}: Add {U} or {R}.",
    entersTappedCondition: "OTHER_LANDS_LE:1",
    abilities: [
        {
            type: AbilityType.Activated,
            id: "{T}: Add {U} or {R}.",
            costs: [{ type: CostType.Tap }],
            isManaAbility: true,
            effects: [
                {
                    type: EffectType.Choice,
                    optional: true,
                    label: "Choose a color",
                    choices: [
                        { label: '{U}', effects: [{ type: EffectType.AddMana, manaType: 'U' }] },
                        { label: '{R}', effects: [{ type: EffectType.AddMana, manaType: 'R' }] }
                    ]
                }
            ]
        }
    ],
    scryfall_id: "bd3ae4fa-4c97-410a-8c0a-bd203342595d",
    image_url: "https://cards.scryfall.io/normal/front/b/d/bd3ae4fa-4c97-410a-8c0a-bd203342595d.jpg?1775938837",
    rarity: "rare"
};

