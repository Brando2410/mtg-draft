import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';
    export const ManaSculpt: CardDefinition = {
    name: "Mana Sculpt",
    manaCost: "{1}{U}{U}",
    scryfall_id: "200c8e3d-c53b-40c7-a29a-fccc1281bfc6",
    rarity: "rare",
    image_url: "https://cards.scryfall.io/normal/front/2/0/200c8e3d-c53b-40c7-a29a-fccc1281bfc6.jpg?1775937307",
    colors: [
        "U"
    ],
    types: [
        "Instant"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Counter target spell. If you control a Wizard, add an amount of {C} equal to the amount of mana spent to cast that spell at the beginning of your next main phase.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{ type: AbilityType.Spell, zone: Zone.Stack }],
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
                    eventMatch: TriggerEvent.PreCombatMainPhaseStart, // Or ON_BEGIN_PHASE_PRECOMBAT_MAIN
                            condition: ConditionType.IsYourTurn,
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
    
