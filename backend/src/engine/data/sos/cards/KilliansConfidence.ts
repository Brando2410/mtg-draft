import { AbilityType, CardDefinition, CostType, DurationType, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';
    export const KilliansConfidence: CardDefinition = {
    name: "Killian's Confidence",
    manaCost: "{W}{B}",
    colors: [
        "B",
        "W"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Target creature gets +1/+1 until end of turn. Draw a card.\nWhenever one or more creatures you control deal combat damage to a player, you may pay {W/B}. If you do, return this card from your graveyard to your hand.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.Creature,
                count: 1,
            },
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    powerModifier: 1,
                    toughnessModifier: 1,
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.DrawCards,
                    amount: 1,
                    targetMapping: TargetMapping.Controller
                }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.DamageDealtToPlayer,
            activeZone: Zone.Graveyard,
            condition: (state: any, event: any, trigger: any) => {
                const source = state.battlefield.find((o: any) => o.id === event.sourceId);
                return event.data?.isCombat && source && source.controllerId === trigger.controllerId;
            },
            effects: [
                {
                    type: CostType.Choice,
                    label: "Return Killian's Confidence to hand?",
                    choices: [
                        {
                            label: "Pay {W/B}",
                            effects: [
                                { type: EffectType.PayMana, value: '{W/B}' } as any,
                                { type: EffectType.MoveToZone, zone: Zone.Hand, targetMapping: TargetMapping.Self }
                            ]
                        },
                        { label: "Decline", effects: [] }
                    ]
                }
            ]
        }
    ]
};
    
