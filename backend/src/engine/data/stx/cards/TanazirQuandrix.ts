import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const TanazirQuandrix: CardDefinition = {
        name: "Tanazir Quandrix",
        manaCost: "{3}{G}{U}",
        colors: ["G", "U"],
        supertypes: ["Legendary"],
        types: ["Creature"],
        subtypes: ["Elder", "Dragon"],
        power: "4",
        toughness: "4",
        keywords: ["Flying", "Trample"],
        oracleText: "Flying, trample. When Tanazir Quandrix enters the battlefield, choose target creature you control. Put a number of +1/+1 counters on it equal to Tanazir Quandrix's power. Whenever Tanazir Quandrix attacks, you may have the base power and toughness of other creatures you control become Tanazir Quandrix's power and toughness until end of turn.",
        abilities: [
            {
                type: AbilityType.Triggered,
                eventMatch: TriggerEvent.EnterBattlefield,
                targetDefinition: { count: 1, type: TargetType.Permanent, restrictions: [{ type: 'Type', value: 'Creature' }, { type: 'Source', value: 'CONTROLLER' }] },
                effects: [{ type: EffectType.AddCounters, counterType: 'P1P1', amount: DynamicAmount.SourcePower, targetMapping: TargetMapping.Target1 }]
            },
            {
                type: AbilityType.Triggered,
                eventMatch: TriggerEvent.Attack,
                triggerCondition: "SelfAttacks",
                effects: [{
                    type: EffectType.ApplyContinuousEffect,
                    duration: 'UNTIL_END_OF_TURN',
                    optional: true,
                    targetMapping: TargetMapping.OtherCreaturesYouControl,
                    powerSet: DynamicAmount.SourcePower,
                    toughnessSet: DynamicAmount.SourceToughness
                }]
            }
        ]
    };
