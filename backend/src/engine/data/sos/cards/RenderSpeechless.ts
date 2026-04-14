import { CardDefinition, AbilityType, EffectType, TargetMapping, Zone } from '@shared/engine_types';

export const RenderSpeechless: CardDefinition = {
    "name": "Render Speechless",
    "manaCost": "{2}{W}{B}",
    "colors": [
        "B",
        "W"
    ],
    "types": [
        "Sorcery"
    ],
    "subtypes": [],
    "oracleText": "Target opponent reveals their hand. You choose a nonland card from it. That player discards that card.\nPut two +1/+1 counters on up to one target creature.",
    "abilities": [
        {
            type: AbilityType.Spell,
            targetDefinition: { type: 'Player', count: 1, restrictions: ['Opponent'] },
            effects: [
                {
                    type: EffectType.Choice,
                    label: 'Choose a nonland card',
                    targetMapping: TargetMapping.Target1,
                    targetIdMapping: 'TARGET_1_HAND',
                    restrictions: ['Nonland'],
                    effects: [{ type: EffectType.MoveToZone, destination: Zone.Graveyard, targetMapping: 'SELECTED_CARD', isDiscard: true }]
                },
                {
                    type: EffectType.Choice,
                    label: "Put two +1/+1 counters on up to one target creature?",
                    choices: [
                        {
                            label: "Yes",
                            targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature'] },
                            effects: [
                                { type: EffectType.AddCounters, amount: 2, counterType: '+1/+1', targetMapping: TargetMapping.Target2 }
                            ]
                        },
                        { label: "No", effects: [] }
                    ]
                }
            ]
        }
    ]
};
