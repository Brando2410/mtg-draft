import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping } from '@shared/engine_types';
export const PursuethePast: CardDefinition = {
    name: "Pursue the Past",
    manaCost: "{R}{W}",
    colors: ["R", "W"],
    types: ["Sorcery"],
    subtypes: [],
    keywords: ["Flashback"],
    oracleText: "You gain 2 life. You may discard a card. If you do, draw two cards.\nFlashback {2}{R}{W} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
    flashbackCost: "{2}{R}{W}",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.GainLife,
                    amount: 2,
                    targetMapping: TargetMapping.Controller
                },
                {
                    type: CostType.Choice,
                    label: "Discard a card and draw 2 cards?",
                    optional: true,
                    choices: [
                        {
                            label: "Yes",
                            effects: [
                                {
                                    type: EffectType.DiscardCards,
                                    amount: 1,
                                    targetMapping: TargetMapping.Controller
                                },
                                {
                                    type: EffectType.DrawCards,
                                    amount: 2,
                                    targetMapping: TargetMapping.Controller
                                }
                            ]
                        },
                        {
                            label: "Decline",
                            effects: []
                        }
                    ]
                }
            ]
        }
    ]
};

