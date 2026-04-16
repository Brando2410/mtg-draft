import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const ConfrontthePast: CardDefinition = {
        name: 'Confront the Past',
        manaCost: '{X}{B}',
        colors: ['B'],
        types: ['Sorcery'],
        subtypes: ['Lesson'],
        oracleText: 'Choose one —\n• Return target planeswalker card with mana value X or less from your graveyard to the battlefield.\n• Exile target planeswalker with mana value X or less.',
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [
                    {
                        type: EffectType.Choice,
                        label: "Return or Exile?",
                        choices: [
                            {
                                label: "Return from Graveyard",
                                targetDefinition: { count: 1, type: TargetType.Card, restrictions: [{ type: 'Type', value: 'Planeswalker' }, { type: 'Source', value: 'GRAVEYARD' }, { type: 'ManaValueLessEqualX' }] },
                                effects: [{ type: EffectType.MoveToZone, zone: Zone.Battlefield, targetMapping: TargetMapping.Target1 }]
                            },
                            {
                                label: "Exile from Battlefield",
                                targetDefinition: { count: 1, type: TargetType.Permanent, restrictions: [{ type: 'Type', value: 'Planeswalker' }, { type: 'ManaValueLessEqualX' }] },
                                effects: [{ type: EffectType.Exile, targetMapping: TargetMapping.Target1 }]
                            }
                        ]
                    }
                ]
            }
        ]
    };

