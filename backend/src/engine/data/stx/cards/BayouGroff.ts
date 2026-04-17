import { AbilityType, CardDefinition, CostType, TargetMapping, TargetType } from '@shared/engine_types';

export const BayouGroff: CardDefinition = {
    name: 'Bayou Groff',
    manaCost: '{1}{G}',
    colors: ['G'],
    types: ['Creature'],
    subtypes: ['Dog', 'Plant'],
    power: '5',
    toughness: '4',
    oracleText: 'As an additional cost to cast this spell, sacrifice a creature or pay {3}.',
    abilities: [
        {
            type: AbilityType.Spell,
            additionalCosts: [
                {
                    label: "As an additional cost to cast this spell, sacrifice a creature or pay {3}.",
                    type: 'Choice',
                    choices: [
                        { label: 'Sacrifice a creature', costs: [{ type: CostType.Sacrifice, targetMapping: TargetMapping.Target1, targetDefinition: { count: 1, type: TargetType.Creature } }] },
                        { label: 'Pay {3}', costs: [{ type: CostType.Mana, value: '{3}' }] }
                    ]
                }
            ]
        }
    ]
};

