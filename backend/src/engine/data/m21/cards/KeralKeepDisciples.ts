import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent, } from '@shared/engine_types';

export const KeralKeepDisciples: CardDefinition = {
    name: "Keral Keep Disciples",
    manaCost: "{2}{R}{R}",
    oracleText: "Whenever you activate a loyalty ability of a Chandra planeswalker, this creature deals 1 damage to each opponent.",
    colors: ["R"],
    types: ["Creature"],
    subtypes: ["Human", "Monk"],
    power: "4",
    toughness: "3",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.ActivateLoyalty,
            condition: 'EVENT_PLAYER_IS_YOU && EVENT_OBJECT_MATCHES:planeswalker,chandra',
            effects: [
                {
                    type: EffectType.DealDamage,
                    amount: 1,
                    targetMapping: TargetMapping.EachOpponent
                }
            ]
        }
    ]
};


