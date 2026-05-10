import { AbilityType, CardDefinition, EffectType } from '@shared/engine_types';

export const StoneboundMentor: CardDefinition = {
    name: 'Stonebound Mentor',
    manaCost: '{1}{R}{W}',
    colors: ['R', 'W'],
    types: ['Creature'],
    subtypes: ['Spirit', 'Advisor'],
    power: '3',
    toughness: '3',
    oracleText: 'Whenever one or more cards leave your graveyard, scry 1. This ability triggers only once each turn.',
    abilities: [
      {
        type: AbilityType.Triggered,
                    eventMatch: 'ON_LEAVE_GRAVEYARD',
        maxTriggersPerTurn: 1,
        effects: [{ type: EffectType.Scry, amount: 1 }]
      }
    ],
    scryfall_id: "9c64e954-adfc-40a2-a3b2-85f1b4626976",
    image_url: "https://cards.scryfall.io/normal/front/9/c/9c64e954-adfc-40a2-a3b2-85f1b4626976.jpg?1624740208",
    rarity: "common"
};

