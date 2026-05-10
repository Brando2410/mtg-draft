import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping } from '@shared/engine_types';
export const QuandrixtheProof: CardDefinition = {
    name: "Quandrix, the Proof",
    manaCost: "{4}{G}{U}",
    colors: ["G", "U"],
    types: ["Legendary", "Creature"],
    subtypes: ["Elder", "Dragon"],
    power: "6",
    toughness: "6",
    keywords: ["Flying", "Trample", "Cascade"],
    oracleText: "Flying, trample\nCascade (When you cast this spell, exile cards from the top of your library until you exile a nonland card that costs less. You may cast it without paying its mana cost. Put the exiled cards on the bottom in a random order.)\nInstant and sorcery spells you cast from your hand have cascade.",
    abilities: [
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    layer: 6,
                    targetMapping: TargetMapping.MatchingCards,
                    restrictions: [Restriction.InstantOrSorcery, Restriction.FromHand, Restriction.YouControl],
                    abilitiesToAdd: ['Cascade']
                }
            ]
        }
    ],
    scryfall_id: "015afe31-af3c-4c9b-9997-d7c33b915a33",
    image_url: "https://cards.scryfall.io/normal/front/0/1/015afe31-af3c-4c9b-9997-d7c33b915a33.jpg?1775938517",
    rarity: "mythic"
};

