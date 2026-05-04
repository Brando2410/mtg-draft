import { AbilityType, CardDefinition, EffectType, Restriction, Zone } from '@shared/engine_types';

export const EnvironmentalSciences: CardDefinition = {
    name: 'Environmental Sciences',
    manaCost: '{2}',
    scryfall_id: "46b394fc-a99c-44e7-9226-da0699167541",
    image_url: "https://cards.scryfall.io/normal/front/4/6/46b394fc-a99c-44e7-9226-da0699167541.jpg?1637082125",
    colors: [],
    types: ['Sorcery'],
    subtypes: ['Lesson'],
    oracleText: 'Search your library for a basic land card, reveal it, put it into your hand, then shuffle. You gain 2 life.',
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.SearchLibrary,
                    targetDefinitions: [{
                        count: 1,
                        restrictions: [Restriction.Basic, Restriction.Land]
                    }],
                    zone: Zone.Hand,
                    reveal: true
                },
                { type: EffectType.GainLife, amount: 2 }
            ]
        }
    ]
};
