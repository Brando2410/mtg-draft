import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const IntroductiontoAnnihilation: CardDefinition = {
    name: 'Introduction to Annihilation',
    manaCost: '{5}',
    scryfall_id: "b0bc4682-bcaf-4f51-be0b-9f2851a16e3b",
    image_url: "https://cards.scryfall.io/normal/front/b/0/b0bc4682-bcaf-4f51-be0b-9f2851a16e3b.jpg?1637082326",
    colors: [],
    types: ['Sorcery'],
    subtypes: ['Lesson'],
    oracleText: 'Exile target nonland permanent. Its controller draws a card.',
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                count: 1,
                type: TargetType.NonlandPermanent
            }],
            effects: [
                { type: EffectType.Exile, targetMapping: TargetMapping.Target1 },
                { type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Target1Controller }
            ]
        }
    ]
};

