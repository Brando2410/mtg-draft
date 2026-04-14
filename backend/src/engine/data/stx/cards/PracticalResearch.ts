import { CardDefinition, AbilityType, EffectType, TriggerEvent, Zone, TargetType, TargetMapping, DynamicAmount } from '@shared/engine_types';

export const PracticalResearch: CardDefinition = {
    name: 'Practical Research',
    manaCost: '{3}{U}{R}',
    colors: ['U', 'R'],
    types: ['Instant'],
    oracleText: 'Draw four cards. Then discard two cards unless you discard an instant or sorcery card.',
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                { type: EffectType.DrawCards, amount: 4, targetMapping: TargetMapping.Controller },
                {
                    type: EffectType.Choice,
                    label: "Discard option",
                    choices: [
                        { label: "Discard 1 Instant/Sorcery", effects: [{ type: EffectType.DiscardCards, amount: 1, restrictions: [{ type: 'Any', restrictions: [{ type: 'Type', value: 'Instant' }, { type: 'Type', value: 'Sorcery' }] }] }] },
                        { label: "Discard 2 cards", effects: [{ type: EffectType.DiscardCards, amount: 2 }] }
                    ]
                }
            ]
        }
    ]
  };
