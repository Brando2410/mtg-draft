import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const ArchwayCommons: CardDefinition = {
    name: 'Archway Commons',
    manaCost: '',
    colors: [],
    types: ['Land'],
    oracleText: 'Archway Commons enters the battlefield tapped.\nWhen Archway Commons enters the battlefield, sacrifice it unless you pay {1}.\n{T}: Add one mana of any color.',
    abilities: [
        {
            type: AbilityType.Static,
            effects: [{ type: EffectType.EntersTapped }]
        },
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
            effects: [{
                type: EffectType.Choice,
                label: "Pay {1} or sacrifice Archway Commons?",
                choices: [
                    { label: "Pay {1}", costs: [{ type: 'Mana', value: '{1}' }] },
                    { label: "Sacrifice", effects: [{ type: EffectType.Sacrifice, targetMapping: TargetMapping.Self }] }
                ]
            }]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: 'Tap' }],
            effects: [{
                type: EffectType.Choice,
                label: "Select color",
                choices: [
                    { label: "{W}", effects: [{ type: EffectType.AddMana, value: 'W' }] },
                    { label: "{U}", effects: [{ type: EffectType.AddMana, value: 'U' }] },
                    { label: "{B}", effects: [{ type: EffectType.AddMana, value: 'B' }] },
                    { label: "{R}", effects: [{ type: EffectType.AddMana, value: 'R' }] },
                    { label: "{G}", effects: [{ type: EffectType.AddMana, value: 'G' }] }
                ]
            }]
        }
    ]
  };


