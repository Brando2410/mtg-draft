import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, CostType, Zone, DurationType } from '@shared/engine_types';

export const StoneriseSpirit: CardDefinition = {
    name: 'Stonerise Spirit',
    manaCost: '{1}{W}',
    colors: ['W'],
    types: ['Creature'],
    subtypes: ['Spirit', 'Bird'],
    power: "1",
    toughness: "2",
    keywords: ['Flying'],
    oracleText: 'Flying\n{4}, Exile Stonerise Spirit from your graveyard: Target creature gains flying until end of turn.',
    abilities: [
        {
            type: AbilityType.Activated,
            activeZone: Zone.Graveyard,
            costs: [
                { type: CostType.Mana, value: '{4}' },
                { type: CostType.ExileSelf }
            ],
            targetDefinition: { count: 1, type: TargetType.Creature },
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                targetMapping: TargetMapping.Target1,
                duration: { type: DurationType.UntilEndOfTurn },
                abilitiesToAdd: ['Flying']
            }]
        }
    ]
};

