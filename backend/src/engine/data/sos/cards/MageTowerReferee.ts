import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
export const MageTowerReferee: CardDefinition = {
    name: "Mage Tower Referee",
    manaCost: "{2}",
    colors: [],
    types: ["Artifact", "Creature"],
    subtypes: ["Construct"],
    power: "2",
    toughness: "1",
    keywords: [],
    oracleText: "Whenever you cast a multicolored spell, put a +1/+1 counter on this creature.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastSpell,
            condition: (state, event, ability) => {
                if (event.playerId !== ability.controllerId) return false;
                const card = event.data?.card;
                if (!card) return false;
                const uniqueColors = new Set(card.definition.colors || []);
                return uniqueColors.size >= 2;
            },
            effects: [
                {
                    type: EffectType.AddCounters,
                    counterType: '+1/+1',
                    amount: 1,
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ]
};

