import { AbilityType, ImplementableCard, ZoneRequirement, EffectType } from '@shared/engine_types';

export const BayouGroff: ImplementableCard = {
    name: 'Bayou Groff',
    manaCost: '{1}{G}',
    type_line: 'Creature — Plant Dog',
    types: ['Creature'],
    subtypes: ['Plant', 'Dog'],
    power: '5',
    toughness: '4',
    keywords: [],
    colors: ['green'],
    supertypes: [],
    oracleText: 'As an additional cost to cast this spell, sacrifice a creature or pay {3}.',
    abilities: [
        {
            id: 'bayou_groff_cost',
            type: AbilityType.Static,
            activeZone: ZoneRequirement.Hand,
            effects: [
                {
                    type: EffectType.AdditionalCost,
                    targetMapping: 'SELF',
                    choices: [
                        { 
                            label: 'Sacrifice a creature', 
                            costs: [{ type: 'Sacrifice', restrictions: ['Creature'] }],
                            effects: []
                        },
                        { 
                            label: 'Pay {3}', 
                            costs: [{ type: 'Mana', value: '{3}' }],
                            effects: []
                        }
                    ]
                } as any
            ]
        }
    ]
};
