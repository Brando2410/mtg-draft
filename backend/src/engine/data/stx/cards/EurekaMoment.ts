import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const EurekaMoment: CardDefinition = {
    name: 'Eureka Moment',
    manaCost: '{2}{G}{U}',
    colors: ['G', 'U'],
    types: ['Instant'],
    oracleText: 'Draw two cards. You may put a land card from your hand onto the battlefield.',
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                { type: EffectType.DrawCards, amount: 2, targetMapping: TargetMapping.Controller },
                {
                    type: EffectType.Choice,
                    label: "Put a land onto the battlefield?",
                    optional: true,
                    choices: [{
                        label: "Put Land",
                        effects: [{ type: EffectType.MoveToZone, zone: Zone.Battlefield, targetMapping: 'CONTROLLER_HAND', restrictions: [{ type: 'Type', value: 'Land' }] }]
                    }]
                }
            ]
        }
    ]
  };
