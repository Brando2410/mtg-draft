import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const SanctumofCalmWaters: CardDefinition = {
    name: "Sanctum of Calm Waters",
    manaCost: "{3}{U}",
    oracleText: "At the beginning of your precombat main phase, you may draw X cards, where X is the number of Shrines you control. If you do, discard a card.",
    colors: ["U"],
    supertypes: ["Legendary"],
    types: ["Enchantment"],
    subtypes: ["Shrine"],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.PreCombatMainPhaseStart,
            condition: 'PLAYER_IS_CONTROLLER',
            effects: [
                {
                    type: EffectType.Choice,
                    label: "Draw X cards and discard a card?",
                    choices: [
                        {
                            label: "Yes",
                            effects: [
                                {
                                    type: EffectType.DrawCards,
                                    amount: DynamicAmount.ShrinesYouControlCount,
                                    targetMapping: TargetMapping.Controller
                                },
                                {
                                    type: EffectType.DiscardCards,
                                    amount: 1,
                                    targetMapping: TargetMapping.Controller
                                }
                            ]
                        },
                        { label: "No", effects: [] }
                    ]
                }
            ]
        }
    ]
};
