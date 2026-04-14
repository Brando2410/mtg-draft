import { CardDefinition, AbilityType, EffectType, TargetMapping, Zone } from '@shared/engine_types';

export const ManaSculpt: CardDefinition = {
    "name": "Mana Sculpt",
    "manaCost": "{1}{U}{U}",
    "colors": [
        "U"
    ],
    "types": [
        "Instant"
    ],
    "subtypes": [],
    "oracleText": "Counter target spell. If you control a Wizard, add an amount of {C} equal to the amount of mana spent to cast that spell at the beginning of your next main phase.",
    "abilities": [
        {
            type: AbilityType.Spell,
            targetDefinition: { type: 'Spell', zone: Zone.Stack },
            effects: [
                {
                    type: EffectType.CounterSpell,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.ConditionalEffect,
                    condition: 'CONTROL_SUBTYPE_GE:Wizard,1',
                    effects: [
                        {
                            type: EffectType.CreateDelayedTrigger,
                    eventMatch: 'ON_PRE_COMBAT_MAIN_PHASE_START', // Or ON_BEGIN_PHASE_PRECOMBAT_MAIN
                            condition: 'IS_YOUR_TURN',
                            captureTargetMV: true,
                            effects: [
                                {
                                    type: EffectType.AddMana,
                                    value: '{C}',
                                    amount: 'CAPTURED_AMOUNT',
                                    targetMapping: TargetMapping.Controller
                                }
                            ]
                        } as any
                    ]
                }
            ]
        }
    ]
};




