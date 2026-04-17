import { AbilityType, CardDefinition, EffectType, Zone } from '@shared/engine_types';

export const FieldTrip: CardDefinition = {
    name: 'Field Trip',
    manaCost: '{2}{G}',
    scryfall_id: "f235060a-eb49-4a73-bb5f-01228c3c4070",
    image_url: "https://cards.scryfall.io/normal/front/f/2/f235060a-eb49-4a73-bb5f-01228c3c4070.jpg?1624592751",
    colors: ['G'],
    types: ['Sorcery'],
    oracleText: 'Search your library for a basic Forest card, reveal it, put it into your hand, then shuffle.\nLearn.',
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.SearchLibrary,
                    targetDefinition: {
                        count: 1,
                        restrictions: ['basic', 'forest']
                    },
                    zone: Zone.Hand,
                    reveal: true
                },
                { type: EffectType.Learn }
            ]
        }
    ]
};

