import { CardDefinition, AbilityType, TriggerEvent, EffectType, TargetMapping } from '@shared/engine_types';

export const MageTowerReferee: CardDefinition = {
    "name": "Mage Tower Referee",
    "manaCost": "{2}",
    "colors": [],
    "types": [
        "Artifact",
        "Creature"
    ],
    "subtypes": [
        "Construct"
    ],
    "oracleText": "Whenever you cast a multicolored spell, put a +1/+1 counter on this creature.",
    "abilities": [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.CastSpell,
            condition: (state, event) => {
                const card = event.data?.card;
                if (!card) return false;
                return (card.definition.colors || []).length >= 2;
            },
            effects: [
                {
                    type: EffectType.AddCounters,
                    counterType: 'p1p1',
                    amount: 1,
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
    "power": "2",
    "toughness": "1"
};




