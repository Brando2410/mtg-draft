import { AbilityType, CardDefinition, EffectType, Restriction } from '@shared/engine_types';

export const SpectacleMage: CardDefinition = {
    name: 'Spectacle Mage',
    manaCost: '{1}{U}{R}',
    colors: ['U', 'R'],
    types: ['Creature'],
    subtypes: ['Human', 'Wizard'],
    power: '2',
    toughness: '2',
    keywords: ['Flying'],
    oracleText: 'Flying\nSpells you cast with mana value 5 or greater cost {1} less to cast.',
    abilities: [
        {
            type: AbilityType.Static,
            effects: [{
                type: EffectType.CostReduction,
                reductionAmount: '{1}',
                restrictions: [Restriction.ManaValue5OrGreater]
            }]
        }
    ],
    scryfall_id: "f74223e1-b66b-42fa-aaac-001f5dab2aac",
    image_url: "https://cards.scryfall.io/normal/front/f/7/f74223e1-b66b-42fa-aaac-001f5dab2aac.jpg?1624740097",
    rarity: "common"
};

