import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
export const BorrowedKnowledge: CardDefinition = {
    name: "Borrowed Knowledge",
    manaCost: "{2}{R}{W}",
    colors: ["R", "W"],
    types: ["Sorcery"],
    subtypes: [],
    keywords: [],
    oracleText: "Choose one —\n• Discard your hand, then draw cards equal to the number of cards in target opponent's hand.\n• Discard your hand, then draw cards equal to the number of cards discarded this way.",
    abilities: [
        {
            type: AbilityType.Spell,
            minChoices: 1,
            maxChoices: 1,
            modes: [
                {
                    label: "Discard hand, draw cards equal to opponent's hand size",
                    targetDefinitions: [{ type: TargetType.Opponent, count: 1 }],
                    effects: [
                        { type: EffectType.DiscardCards, amount: 'ALL', targetMapping: TargetMapping.Controller },
                        { type: EffectType.DrawCards, amount: DynamicAmount.Target1HandSize, targetMapping: TargetMapping.Controller }
                    ]
                },
                {
                    label: "Discard hand, draw cards equal to discarded count",
                    effects: [
                        { type: EffectType.DiscardCards, amount: 'ALL', targetMapping: TargetMapping.Controller },
                        { type: EffectType.DrawCards, amount: DynamicAmount.DiscardedCount, targetMapping: TargetMapping.Controller }
                    ]
                }
            ]
        }
    ],
    scryfall_id: "a3226e14-554d-47c9-b8b6-dfeb53cc41ba",
    image_url: "https://cards.scryfall.io/normal/front/a/3/a3226e14-554d-47c9-b8b6-dfeb53cc41ba.jpg?1775938224",
    rarity: "uncommon"
};

