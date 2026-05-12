import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const EmeritusofWoeDemonicTutor: CardDefinition = {
    name: "Emeritus of Woe // Demonic Tutor",
    manaCost: "{3}{B}",
    colors: ["B"],
    types: ["Creature"],
    subtypes: ["Vampire", "Warlock"],
    keywords: ["Prepared"],
    oracleText: "This creature enters prepared. At the beginning of your end step, if two or more creatures died this turn, this creature becomes prepared.",
    power: "5",
    toughness: "4",
    entersPrepared: true,
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EndStep,
            condition: `${ConditionType.CreaturesDiedCountGe}:2 && ${ConditionType.IsYourTurn}`,
            effects: [
                {
                    type: EffectType.Prepare,
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
    preparedFace: {
        name: "Demonic Tutor",

        manaCost: "{1}{B}",
        colors: ["B"],
        types: ["Sorcery"],
        oracleText: "Search your library for a card, put that card into your hand, then shuffle.",
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [
                    {
                        type: EffectType.SearchLibrary,
                        targetDefinitions: [{
                            type: TargetType.Card,
                            count: 1
                        }],
                        zone: Zone.Hand,
                        reveal: true,
                        shuffle: true
                    }
                ]
            }
        ],

    },
    scryfall_id: "7eb9e83d-515d-4911-a06b-9982200277b2",
    image_url: "https://cards.scryfall.io/normal/front/7/e/7eb9e83d-515d-4911-a06b-9982200277b2.jpg?1776269683",
    rarity: "mythic"
};

