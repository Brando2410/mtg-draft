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
    ]
};
