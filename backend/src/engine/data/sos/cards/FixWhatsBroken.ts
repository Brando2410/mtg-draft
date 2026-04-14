import { CardDefinition, AbilityType, EffectType, TargetMapping, Zone } from '@shared/engine_types';

export const FixWhatsBroken: CardDefinition = {
    "name": "Fix What's Broken",
    "manaCost": "{2}{W}{B}",
    "colors": [
        "B",
        "W"
    ],
    "types": [
        "Sorcery"
    ],
    "subtypes": [],
    "oracleText": "As an additional cost to cast this spell, pay X life.\nReturn each artifact and creature card with mana value X from your graveyard to the battlefield.",
    "abilities": [
        {
            type: AbilityType.Spell,
            costs: [{ type: 'PayLife', value: 'X' }],
            effects: [
                { 
                    type: EffectType.MoveToZone, 
                    zone: Zone.Battlefield,
                    targetMapping: TargetMapping.MatchingCards,
                    restrictions: [
                        'Artifact_Or_Creature',
                        'Graveyard',
                        'YouControl',
                        { type: 'ManaValue', comparison: 'Equal', value: 'X' }
                    ]
                }
            ]
        }
    ]
};
