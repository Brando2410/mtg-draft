import { AbilityType, CardDefinition, EffectType } from '@shared/engine_types';

export const KillianInkDuelist: CardDefinition = {
    name: 'Killian, Ink Duelist',
    manaCost: '{W}{B}',
    scryfall_id: "23ef4f09-2aa1-4a03-b2e2-66d1522f1e46",
    image_url: "https://cards.scryfall.io/normal/front/2/3/23ef4f09-2aa1-4a03-b2e2-66d1522f1e46.jpg?1627429378",
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
                    amount: '{2}',
                    condition: 'TARGETS_PERMANENT'
                }
            ]
        }
    ]
};

