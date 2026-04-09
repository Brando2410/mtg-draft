import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const SeetheTruth: Record<string, ImplementableCard> = {
    "See the Truth": {
        name: "See the Truth",
        manaCost: "{1}{U}",
        oracleText: "Look at the top three cards of your library. Put one of them into your hand and the rest on the bottom of your library in any order. If this spell was cast from anywhere other than your hand, instead put all three of those cards into your hand.",
        colors: ["blue"],
        supertypes: [],
        types: ["Sorcery"],
        subtypes: [],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "see_the_truth_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                effects: [
                    {
                        condition: "CAST_FROM_HAND",
                        type: 'LookAtTopAndPick',
                        amount: 3,
                        maxCount: 1,
                        destination: Zone.Hand,
                        remainderZone: Zone.Library,
                        libraryPosition: 'bottom',
                        targetMapping: 'CONTROLLER'
                    },
                    {
                        condition: "NOT_CAST_FROM_HAND",
                        type: 'MoveToZone',
                        selectionType: 'TopN',
                        fromTop: 3,
                        sourceZones: [Zone.Library],
                        destination: Zone.Hand,
                        targetMapping: 'CONTROLLER'
                    }
                ]
            }
        ]
    }
};
