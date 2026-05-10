import { AbilityType, CardDefinition, EffectType } from '@shared/engine_types';

export const KillianInkDuelist: CardDefinition = {
    name: 'Killian, Ink Duelist',
    manaCost: '{W}{B}',

    colors: ['W', 'B'],
    types: ['Creature'],
    subtypes: ['Human', 'Warlock'],
    supertypes: ['Legendary'],
    power: "2",
    toughness: "2",
    keywords: ['Lifelink', 'Menace'],
    oracleText: 'Lifelink, Menace\nSpells you cast that target a permanent cost {2} less to cast.',
    abilities: [
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.CostReduction,
                    reductionAmount: '{2}',
                    condition: 'TARGETS_PERMANENT'
                }
            ]
        }
    ],
    scryfall_id: "9f51c115-dc9b-40a4-849d-3fc0c26e5a39",
    image_url: "https://cards.scryfall.io/normal/front/9/f/9f51c115-dc9b-40a4-849d-3fc0c26e5a39.jpg?1775941809",
    rarity: "uncommon"
};

