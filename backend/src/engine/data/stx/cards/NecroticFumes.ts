import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const NecroticFumes: CardDefinition = {
    name: 'Necrotic Fumes',
    manaCost: '{1}{B}',
    colors: ['B'],
    types: ['Sorcery'],
    subtypes: ['Lesson'],
    oracleText: 'As an additional cost to cast this spell, exile a creature you control.\nExile target creature or planeswalker.',
    abilities: [
        {
            type: AbilityType.Static,
            activeZone: Zone.Hand,
            effects: [
                {
                    type: EffectType.AdditionalCost,
                    targetMapping: TargetMapping.Controller,
                    additionalCost: {
                        type: CostType.Exile,
                        restrictions: ['Creature', 'youcontrol']
                    }
                }
            ]
        },
        {
            type: AbilityType.Spell,
            targetDefinition: {
                count: 1,
                type: TargetType.CreatureOrPlaneswalker,
            },
            effects: [{ type: EffectType.Exile, targetMapping: TargetMapping.Target1 }]
        }
    ]
};

