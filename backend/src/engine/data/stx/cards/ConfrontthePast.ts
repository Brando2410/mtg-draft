import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

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
                            targetDefinition: { count: 1, type: TargetType.CardInGraveyard, restrictions: ['Planeswalker', 'mv <= x'] },
                            effects: [{ type: EffectType.MoveToZone, zone: Zone.Battlefield, targetMapping: TargetMapping.Target1 }]
                        },
                        {
                            label: "Exile from Battlefield",
                            targetDefinition: { count: 1, type: TargetType.Planeswalker, restrictions: ['mv <= x'] },
                            effects: [{ type: EffectType.Exile, targetMapping: TargetMapping.Target1 }]
                        }
                    ]
                }
            ]
        }
    ]
};

