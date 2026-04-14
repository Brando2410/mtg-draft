import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const DinaSoulSteeper: CardDefinition = {
        name: 'Dina, Soul Steeper',
        manaCost: '{B}{G}',
        colors: ['B', 'G'],
        types: ['Creature'],
        subtypes: ['Dryad', 'Druid'],
        supertypes: ['Legendary'],
        power: "1",
        toughness: "1",
        oracleText: "Whenever you gain life, each opponent loses 1 life.\n{1}, Sacrifice another creature: Dina, Soul Steeper gets +X/+0 until end of turn, where X is the sacrificed creature's power.",
        abilities: [
            {
                type: AbilityType.Triggered,
                eventMatch: TriggerEvent.LifeGain,
                condition: 'YouGainedLife',
                effects: [{ type: EffectType.LoseLife, amount: 1, targetMapping: TargetMapping.EachOpponent }]
            },
            {
                type: AbilityType.Activated,
                costs: [
                    { type: 'Mana', value: '{1}' },
                    { type: 'Sacrifice', restriction: { type: 'Not', restriction: { type: 'Self' } } }
                ],
                effects: [
                    {
                        type: EffectType.ApplyContinuousEffect,
                        targetMapping: TargetMapping.Self,
                        duration: 'UNTIL_END_OF_TURN',
                        powerModifier: 'SACRIFICED_OBJECT_POWER'
                    }
                ]
            }
        ]
    };
