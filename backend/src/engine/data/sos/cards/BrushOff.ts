import { AbilityType, CardDefinition, EffectType, TargetMapping } from '@shared/engine_types';
    export const BrushOff: CardDefinition = {
    name: "Brush Off",
    manaCost: "{2}{U}{U}",
    scryfall_id: "151eab82-d20f-433b-b3bb-1d44e2871d5c",
    rarity: "uncommon",
    image_url: "https://cards.scryfall.io/normal/front/1/5/151eab82-d20f-433b-b3bb-1d44e2871d5c.jpg?1775937183",
    colors: [
        "U"
    ],
    types: [
        "Instant"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "This spell costs {1}{U} less to cast if it targets an instant or sorcery spell.\nCounter target spell.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{ type: AbilityType.Spell, count: 1 }],
            costReduction: {
                type: EffectType.CostReduction,
                reductionAmount: '{1}{U}',
                condition: 'TARGET_IS_INSTANT_OR_SORCERY'
            },
            effects: [
                { type: EffectType.CounterSpell, targetMapping: TargetMapping.Target1 }
            ]
        }
    ]
};
    
