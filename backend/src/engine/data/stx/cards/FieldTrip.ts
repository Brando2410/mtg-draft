import { AbilityType, CardDefinition, EffectType, Restriction, Zone } from '@shared/engine_types';

export const FieldTrip: CardDefinition = {
    name: 'Field Trip',
    manaCost: '{2}{G}',
    colors: ['G'],
    types: ['Sorcery'],
    oracleText: 'Search your library for a basic Forest card, reveal it, put it into your hand, then shuffle.\nLearn.',
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.SearchLibrary,
                    targetDefinitions: [{
                        count: 1,
                        restrictions: [Restriction.Basic, Restriction.Forest]
                    }],
                    zone: Zone.Hand,
                    reveal: true
                },
                { type: EffectType.Learn }
            ]
        }
    ],
    scryfall_id: "f235060a-eb49-4a73-bb5f-01228c3c4070",
    image_url: "https://cards.scryfall.io/normal/front/f/2/f235060a-eb49-4a73-bb5f-01228c3c4070.jpg?1624592751",
    rarity: "common"
};

