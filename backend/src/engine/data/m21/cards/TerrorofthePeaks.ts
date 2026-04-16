import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const TerrorofthePeaks: CardDefinition = {
    name: "Terror of the Peaks",
    manaCost: "{3}{R}{R}",
    oracleText: "Spells your opponents cast that target Terror of the Peaks cost an additional 3 life to cast.\nWhenever another creature enters the battlefield under your control, Terror of the Peaks deals damage equal to that creature's power to any target.",
    colors: ["R"],
    types: ["Creature"],
    subtypes: ["Dragon"],
    power: "5",
    toughness: "4",
    keywords: ["Flying"],
    abilities: [
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.AdditionalCost,
                    targetDefinition: { type: TargetType.Opponent },
                    condition: 'SPELL_TARGETS_SOURCE',
                    additionalCosts: [{ type: CostType.PayLife, value: 3 }]
                }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefieldOther,
            condition: (state: any, event: any, source: any) => {
                const object = state.battlefield.find((o: any) => o.id === event.sourceId);
                return object && object.controllerId === source.controllerId && object.definition.types.some((t: string) => t.toLowerCase() === 'creature');
            },
            targetDefinition: {
                type: TargetType.AnyTarget,
                count: 1
            },
            effects: [
                {
                    type: EffectType.DealDamage,
                    // Functional amount from entering creature's power
                    amount: (state: any, source: any, targets: any, context: any) => {
                        const enteringObj = context?.data?.eventData?.data?.object;
                        if (!enteringObj) return 0;
                        const { LayerProcessor } = require('./../state/LayerProcessor');
                        const stats = LayerProcessor.getEffectiveStats(enteringObj, state);
                        return stats.power;
                    },
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
