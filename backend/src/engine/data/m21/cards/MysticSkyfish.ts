import { AbilityType, CardDefinition, ConditionType, DurationType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const MysticSkyfish: CardDefinition = {
    name: "Mystic Skyfish",
    manaCost: "{2}{U}",

    oracleText: "Whenever you draw your second card each turn, Mystic Skyfish gains flying until end of turn.",
    colors: ["U"],
    types: ["Creature"],
    subtypes: ["Fish"],
    power: "3",
    toughness: "1",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.SecondDraw,
            condition: ConditionType.PlayerIsController,
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                duration: { type: DurationType.UntilEndOfTurn },
                abilitiesToAdd: ['Flying'],
                layer: 6,
                targetMapping: TargetMapping.Self
            }]
        }
    ],
    scryfall_id: "0002ab72-834b-4c81-82b1-0d2760ea96b0",
    image_url: "https://cards.scryfall.io/normal/front/0/0/0002ab72-834b-4c81-82b1-0d2760ea96b0.jpg?1596250027",
    rarity: "common"
};

