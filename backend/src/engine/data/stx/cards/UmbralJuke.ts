import { AbilityType, CardDefinition, ConditionType, EffectType, Restriction, TargetMapping } from '@shared/engine_types';

export const UmbralJuke: CardDefinition = {
    name: 'Umbral Juke',
    manaCost: '{2}{B}',
    colors: ['B'],
    types: ['Instant'],
    oracleText: "Each opponent sacrifices a creature or planeswalker. If you cast this spell during your main phase, create a 2/1 white and black Inkling creature token with flying.",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.Sacrifice,
                    targetMapping: TargetMapping.EachOpponent,
                    restrictions: [Restriction.CreatureOrPlaneswalker]
                },
                {
                    type: EffectType.CreateToken,
                    condition: ConditionType.CastDuringMainPhase,
                    tokenBlueprint: {
                        name: 'Inkling',
                        power: "2",
                        toughness: "1",
                        colors: ['W', 'B'],
                        types: ['Creature', 'Token'],
                        subtypes: ['Inkling'],
                        keywords: ['Flying']
                    }
                }
            ]
        }
    ],
    scryfall_id: "3fbd0921-e953-492b-ad73-c8a8bfaa750b",
    image_url: "https://cards.scryfall.io/normal/front/3/f/3fbd0921-e953-492b-ad73-c8a8bfaa750b.jpg?1624591481",
    rarity: "uncommon"
};

