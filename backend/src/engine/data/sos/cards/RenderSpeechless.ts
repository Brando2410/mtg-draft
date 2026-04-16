import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

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
            effects: [
                {
                    type: EffectType.Choice,
                    label: 'Choose a nonland card',
                    targetMapping: TargetMapping.Controller,
                    targetIdMapping: 'OPPONENT_HAND_REVEAL_PICK',
                    restrictions: ['Nonland'],
                    effects: [{ type: EffectType.MoveToZone, zone: Zone.Graveyard, targetMapping: TargetMapping.SelectedCard, isDiscard: true }]
                },
                {
                    type: EffectType.AddCounters,
                    targetDefinition: {
                        type: TargetType.Creature,
                        count: 1,
                        minCount: 0,
                        restrictions: ['Creature']
                    },

                    amount: 2,
                    counterType: 'p1p1',

                }
            ]
        }
    ]
};

