import { CardDefinition, AbilityType, EffectType, TriggerEvent, TargetMapping } from '@shared/engine_types';

export const SpiritMascot: CardDefinition = {
    "name": "Spirit Mascot",
    "manaCost": "{R}{W}",
    "colors": [
        "R",
        "W"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Spirit",
        "Ox"
    ],
    "oracleText": "Whenever one or more cards leave your graveyard, put a +1/+1 counter on this creature.",
    "abilities": [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.LeaveGraveyard,
            condition: 'YOUR_CARD_LEAVES_GRAVEYARD',
            effects: [
                {
                    type: EffectType.AddCounters,
                    counterType: '+1/+1',
                    amount: 1,
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
    "power": "2",
    "toughness": "2"
};




