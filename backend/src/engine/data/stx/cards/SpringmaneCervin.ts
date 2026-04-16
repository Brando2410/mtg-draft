import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const SpringmaneCervin: CardDefinition = {
    name: 'Springmane Cervin',
    manaCost: '{2}{G}',
    colors: ['G'],
    types: ['Creature'],
    subtypes: ['Elk'],
    power: "3",
    toughness: "2",
    oracleText: 'When Springmane Cervin enters the battlefield, you gain 2 life.',
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
            effects: [{ type: EffectType.GainLife, amount: 2, targetMapping: TargetMapping.Controller }]
        }
    ]
  };


