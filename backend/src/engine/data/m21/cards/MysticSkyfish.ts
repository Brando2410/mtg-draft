import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const MysticSkyfish: CardDefinition = {

    name: "Mystic Skyfish",
    manaCost: "{2}{U}",
    scryfall_id: "0002ab72-834b-4c81-82b1-0d2760ea96b0",
    image_url: "https://cards.scryfall.io/normal/front/0/0/0002ab72-834b-4c81-82b1-0d2760ea96b0.jpg?1596250027",
    oracleText: "Whenever you draw your second card each turn, Mystic Skyfish gains flying until end of turn.",
    colors: ["U"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Fish"],
    power: "3",
    toughness: "1",
    keywords: [],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.SecondDraw,
            condition: 'EVENT_PLAYER_IS_YOU',
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                duration: { type: DurationType.UntilEndOfTurn },
                abilitiesToAdd: ['Flying'],
                layer: 6,
                targetMapping: TargetMapping.Self
            }]
        }
    ]

};




