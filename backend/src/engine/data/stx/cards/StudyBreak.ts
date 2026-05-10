import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const StudyBreak: CardDefinition = {
    name: 'Study Break',
    manaCost: '{1}{W}',
    colors: ['W'],
    types: ['Instant'],
    oracleText: "Tap up to two target creatures. Learn.",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                count: 2,
                type: TargetType.Creature,
                minCount: 0
            }],
            effects: [
                { type: EffectType.Tap, targetMapping: TargetMapping.TargetAll },
                { type: EffectType.Learn }
            ]
        }
    ],
    scryfall_id: "ef7cd813-0781-4fd7-8748-2716e1eeb4b9",
    image_url: "https://cards.scryfall.io/normal/front/e/f/ef7cd813-0781-4fd7-8748-2716e1eeb4b9.jpg?1624589885",
    rarity: "common"
};

