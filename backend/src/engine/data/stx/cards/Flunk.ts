import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const Flunk: CardDefinition = {
    name: 'Flunk',
    manaCost: '{1}{B}',

    colors: ['B'],
    types: ['Instant'],
    oracleText: 'Target creature gets -X/-X until end of turn, where X is 7 minus the number of cards in its controller\'s hand.',
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{ count: 1, type: TargetType.Creature }],
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                targetMapping: TargetMapping.Target1,
                duration: { type: DurationType.UntilEndOfTurn },
                powerModifier: 'TARGET_HAND_SIZE_7_MINUS',
                toughnessModifier: 'TARGET_HAND_SIZE_7_MINUS'
            }]
        }
    ],
    scryfall_id: "f8487884-e991-4feb-823b-90d9125edf19",
    image_url: "https://cards.scryfall.io/normal/front/f/8/f8487884-e991-4feb-823b-90d9125edf19.jpg?1624590966",
    rarity: "uncommon"
};

