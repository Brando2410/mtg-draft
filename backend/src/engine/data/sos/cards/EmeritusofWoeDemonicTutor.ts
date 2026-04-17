import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';
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
    image_url: "https://cards.scryfall.io/png/front/7/e/7eb9e83d-515d-4911-a06b-9982200277b2.png?1776269683",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EndStep,
            condition: 'CREATURES_DIED_COUNT_GE:2 && OUR_TURN',
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
        image_url: "https://cards.scryfall.io/png/front/a/2/a24b4cb6-cebb-428b-8654-74347a6a8d63.png?1690004294",
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
                        targetDefinition: {
                            type: TargetType.Card,
                            count: 1
                        },
                        zone: Zone.Hand,
                        reveal: true,
                        targetMapping: TargetMapping.Controller
                    }
                ]
            }
        ]
    }
};
    
