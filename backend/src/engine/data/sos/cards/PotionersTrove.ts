import { AbilityType, CardDefinition, ConditionType, CostType, EffectType, TargetMapping } from '@shared/engine_types';
export const PotionersTrove: CardDefinition = {
    name: "Potioner's Trove",
    manaCost: "{3}",
    scryfall_id: "2123b349-4649-4a15-a8b5-b54414d2b1b7",
    rarity: "common",
    image_url: "https://cards.scryfall.io/normal/front/2/1/2123b349-4649-4a15-a8b5-b54414d2b1b7.jpg?1775938752",
    colors: [],
    types: [
        "Artifact"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "{T}: Add one mana of any color.\n{T}: You gain 2 life. Activate only if you've cast an instant or sorcery spell this turn.",
    abilities: [
        {
            type: AbilityType.Activated,
            id: "{T}: Add one mana of any color",
            costs: [{ type: CostType.Tap }],
            isManaAbility: true,
            effects: [
                {
                    type: CostType.Choice,
                    label: "Select color",
                    choices: [
                        { label: "{W}", effects: [{ type: EffectType.AddMana, manaType: 'W' }] },
                        { label: "{U}", effects: [{ type: EffectType.AddMana, manaType: 'U' }] },
                        { label: "{B}", effects: [{ type: EffectType.AddMana, manaType: 'B' }] },
                        { label: "{R}", effects: [{ type: EffectType.AddMana, manaType: 'R' }] },
                        { label: "{G}", effects: [{ type: EffectType.AddMana, manaType: 'G' }] }
                    ]
                }
            ]
        },
        {
            type: AbilityType.Activated,
            id: "{T}: You gain 2 life. (Activate only if you've cast an instant or sorcery spell this turn.)",
            costs: [{ type: CostType.Tap }],
            condition: ConditionType.CastInstantSorceryThisTurn,
            effects: [
                {
                    type: EffectType.GainLife,
                    amount: 2,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};

