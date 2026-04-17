import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const Expel: CardDefinition = {
    name: 'Expel',
    manaCost: '{2}{W}',
    scryfall_id: "be517a58-b7ee-4213-98a5-8c19e1b2def6",
    image_url: "https://cards.scryfall.io/normal/front/b/e/be517a58-b7ee-4213-98a5-8c19e1b2def6.jpg?1624589466",
    colors: ['W'],
    types: ['Instant'],
    oracleText: 'Exile target tapped creature.',
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                count: 1,
                type: TargetType.Creature,
                restrictions: ['tapped']
            },
            effects: [{ type: EffectType.Exile, targetMapping: TargetMapping.Target1 }]
        }
    ]
};
