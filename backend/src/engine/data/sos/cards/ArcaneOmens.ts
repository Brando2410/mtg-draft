import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping } from '@shared/engine_types';
    export const ArcaneOmens: CardDefinition = {
    name: "Arcane Omens",
    manaCost: "{4}{B}",
    colors: [
        "B"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Converge — Target player discards X cards, where X is the number of colors of mana spent to cast this spell.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: { type: 'Player' },
            effects: [
                {
                    type: EffectType.DiscardCards,
                    amount: DynamicAmount.ConvergeAmount,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
    