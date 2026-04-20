import { AbilityType, CardDefinition, EffectType, Restriction, Zone } from '@shared/engine_types';

export const BasicConjuration: CardDefinition = {
    name: 'Basic Conjuration',
    manaCost: '{1}{G}',
    scryfall_id: "8be52d88-f430-4437-a0d3-590c2947c838",
    image_url: "https://cards.scryfall.io/normal/front/8/b/8be52d88-f430-4437-a0d3-590c2947c838.jpg?1637082092",
    colors: ['G'],
    types: ['Sorcery'],
    subtypes: ['Lesson'],
    oracleText: 'Look at the top six cards of your library. You may reveal a creature card from among them and put it into your hand. Put the rest on the bottom of your library in a random order. You gain 2 life.',
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.LookAtTopAndPick,
                    fromTop: 6,
                    optional: true,
                    restrictions: [Restriction.Creature],
                    reveal: true,
                    zone: Zone.Hand,
                    remainderZone: Zone.Library,
                    remainderPosition: 'bottom',
                    shuffleRemainder: true
                },
                { type: EffectType.GainLife, amount: 2 }
            ]
        }
    ]
};
