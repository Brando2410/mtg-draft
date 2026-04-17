import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, DurationType } from '@shared/engine_types';

export const LashofMalice: CardDefinition = {
    name: 'Lash of Malice',
    manaCost: '{B}',
    scryfall_id: "af3da2c6-29ed-4563-8bae-d1cc05df8897",
    image_url: "https://cards.scryfall.io/normal/front/a/f/af3da2c6-29ed-4563-8bae-d1cc05df8897.jpg?1624591043",
    colors: ['B'],
    types: ['Instant'],
    oracleText: 'Target creature gets +2/-2 until end of turn.',
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: { count: 1, type: TargetType.Creature },
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                targetMapping: TargetMapping.Target1,
                duration: { type: DurationType.UntilEndOfTurn },
                powerModifier: 2,
                toughnessModifier: -2
            }]
        }
    ]
};

