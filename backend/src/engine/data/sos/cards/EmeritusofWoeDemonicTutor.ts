import { CardDefinition, AbilityType, EffectType, TargetMapping, TriggerEvent, Zone, SelectionType } from '@shared/engine_types';

export const EmeritusofWoeDemonicTutor: CardDefinition = {
    name: "Emeritus of Woe",
    manaCost: "{3}{B}",
    colors: ["B"],
    types: ["Creature"],
    subtypes: ["Vampire", "Warlock"],
    power: "5",
    toughness: "4",
    keywords: ["Prepared"],
    oracleText: "This creature enters prepared. At the beginning of your end step, if two or more creatures died this turn, this creature becomes prepared.",
    entersPrepared: true,
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
        manaCost: "{1}{B}",
        colors: ["B"],
        types: ["Sorcery"],
        oracleText: "Search your library for a card, put that card into your hand, then shuffle.",
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [
                    {
                        type: EffectType.MoveToZone,
                        selectionType: SelectionType.Search,
                        sourceZones: [Zone.Library],
                        destination: Zone.Hand,
                        reveal: true,
                        shuffle: true,
                        amount: 1
                    }
                ]
            }
        ]
    }
};
