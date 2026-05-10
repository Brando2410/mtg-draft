import { AbilityType, CardDefinition, CounterType, EffectType, TriggerEvent } from '@shared/engine_types';

export const ManifestationSage: CardDefinition = {
    name: 'Manifestation Sage',
    manaCost: '{3}{G}{U}',

    colors: ['G', 'U'],
    types: ['Creature'],
    subtypes: ['Human', 'Wizard'],
    power: "2",
    toughness: "2",
    oracleText: 'When Manifestation Sage enters the battlefield, create a 0/0 green and blue Fractal creature token. Put X +1/+1 counters on it, where X is the number of cards in your hand.',
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [{
                type: EffectType.CreateToken,
                tokenBlueprint: {
                    name: 'Fractal',
                    power: "0",
                    toughness: "0",
                    colors: ['G', 'U'],
                    types: ['Creature', 'Token'],
                    subtypes: ['Fractal']
                },
                amount: 1,
                startingCounters: { counterType: CounterType.P1P1, amount: 'CARDS_IN_HAND_COUNT' }

            }]
        }
    ],
    scryfall_id: "76fc5cd2-fbb0-4d13-9089-0292b356de48",
    image_url: "https://cards.scryfall.io/normal/front/7/6/76fc5cd2-fbb0-4d13-9089-0292b356de48.jpg?1627429666",
    rarity: "rare"
};

