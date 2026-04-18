import { AbilityType, CardDefinition, CostType, EffectType } from '@shared/engine_types';
export const DreamrootCascade: CardDefinition = {
    name: "Dreamroot Cascade",
    manaCost: "",
    scryfall_id: "ef662b92-5a7f-48c9-bcc1-14b55e091aef",
    rarity: "rare",
    image_url: "https://cards.scryfall.io/normal/front/e/f/ef662b92-5a7f-48c9-bcc1-14b55e091aef.jpg?1775938773",
    colors: [],
    types: [
        "Land"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "This land enters tapped unless you control two or more other lands.\n{T}: Add {G} or {U}.",
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
                        { label: '{G}', effects: [{ type: EffectType.AddMana, manaType: 'G' }] },
                        { label: '{U}', effects: [{ type: EffectType.AddMana, manaType: 'U' }] }
                    ]
                }
            ]
        }
    ]
};
