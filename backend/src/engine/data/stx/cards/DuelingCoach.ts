import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const DuelingCoach: CardDefinition = {
    name: 'Dueling Coach',
    manaCost: '{3}{W}',
    colors: ['W'],
    types: ['Creature'],
    subtypes: ['Human', 'Wizard'],
    power: "2",
    toughness: "2",
    oracleText: 'When Dueling Coach enters the battlefield, put a +1/+1 counter on target creature.\n{4}, {T}: Put a +1/+1 counter on each creature you control with a +1/+1 counter on it.',
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            targetDefinition: { count: 1, type: TargetType.Permanent, restrictions: [{ type: 'Type', value: 'Creature' }] },
            effects: [{ type: EffectType.AddCounters, counterType: 'P1P1', amount: 1, targetMapping: TargetMapping.Target1 }]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: 'Mana', value: '{4}' }, { type: 'Tap' }],
            effects: [{
                type: EffectType.AddCounters,
                counterType: 'P1P1',
                amount: 1,
                targetMapping: TargetMapping.AllMatchingPermanentsYouControl,
                restrictions: [{ type: 'HasCounter', value: 'P1P1' }]
            }]
        }
    ]
  };
