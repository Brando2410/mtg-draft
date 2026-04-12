import { AbilityType, ImplementableCard, ZoneRequirement, TriggerEvent, EffectType } from '@shared/engine_types';

export const DinaSoulSteeper: ImplementableCard = {
    name: 'Dina, Soul Steeper',
    manaCost: '{B}{G}',
    type_line: 'Legendary Creature — Dryad Druid',
    types: ['Creature'],
    subtypes: ['Dryad', 'Druid'],
    power: '1',
    toughness: '3',
    keywords: [],
    colors: ['black', 'green'],
    supertypes: ['Legendary'],
    oracleText: 'Whenever you gain life, each opponent loses 1 life.\n{1}, Sacrifice another creature: Dina gets +X/+0 until end of turn, where X is the sacrificed creature’s power.',
    abilities: [
        {
            id: 'dina_drain_trigger',
            type: AbilityType.Triggered,
            activeZone: ZoneRequirement.Battlefield,
            triggerEvent: TriggerEvent.LifeGain,
            triggerCondition: (state: any, event: any, source: any) => event.playerId === source.controllerId,
            effects: [
                {
                    type: EffectType.LoseLife,
                    targetMapping: 'OPPONENT',
                    amount: 1
                }
            ]
        },
        {
            id: 'dina_pump_ability',
            type: AbilityType.Activated,
            activeZone: ZoneRequirement.Battlefield,
            costs: [
                { type: 'Mana', value: '{1}' },
                { 
                    type: 'Sacrifice', 
                    restrictions: ['Creature', 'ANOTHER'] 
                }
            ],
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: 'SELF',
                    duration: 'UNTIL_END_OF_TURN',
                    powerModifier: 'SACRIFICED_OBJECT_POWER'
                }
            ]
        }
    ]
};
