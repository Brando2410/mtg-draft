import { CardDefinition, AbilityType, TriggerEvent, EffectType, TargetMapping, TargetType, AbilityRestriction } from '@shared/engine_types';

export const JoinedResearchersSecretRendezvous: CardDefinition = {
    "name": "Joined Researchers // Secret Rendezvous",
    "manaCost": "{1}{W} // {1}{W}{W}",
    "colors": [
        "W"
    ],
    "types": [
        "Creature",
        "Sorcery"
    ],
    "subtypes": [
        "Human",
        "Cleric",
        "Wizard"
    ],
    "oracleText": "Joined Researchers (Creature): First strike\nAt the beginning of each end step, if an opponent has more cards in hand than you, Joined Researchers becomes prepared.\nSecret Rendezvous (Sorcery): You and target opponent each draw three cards.",
    "abilities": [],
    "power": "2",
    "toughness": "2",
    "faces": [
        {
            "name": "Joined Researchers",
            "manaCost": "{1}{W}",
            "colors": ["W"],
            "types": ["Creature"],
            "subtypes": ["Human", "Cleric", "Wizard"],
            "oracleText": "First strike\nAt the beginning of each end step, if an opponent has more cards in hand than you, Joined Researchers becomes prepared.",
            "keywords": ["First Strike"],
            "abilities": [
                {
                    type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EndStep,
                    condition: 'OPPONENT_HAS_MORE_CARDS',
                    effects: [{ type: EffectType.Prepare, targetMapping: TargetMapping.Self }]
                }
            ],
            "power": "2",
            "toughness": "2"
        },
        {
            "name": "Secret Rendezvous",
            "manaCost": "{1}{W}{W}",
            "colors": ["W"],
            "types": ["Sorcery"],
            "subtypes": [],
            "oracleText": "You and target opponent each draw three cards.",
            "abilities": [
                {
                    type: AbilityType.Spell,
                    targetDefinition: { 
                        type: TargetType.Player,
                        count: 1,
                        restrictions: [{ type: 'Opponent' } as any] 
                    },
                    effects: [
                        {
                            type: EffectType.DrawCards,
                            amount: 3,
                            targetMapping: TargetMapping.Controller
                        },
                        {
                            type: EffectType.DrawCards,
                            amount: 3,
                            targetMapping: TargetMapping.Target1
                        }
                    ]
                }
            ]
        }
    ]
};


