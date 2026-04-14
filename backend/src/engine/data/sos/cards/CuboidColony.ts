import { CardDefinition, AbilityType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const CuboidColony: CardDefinition = {
    "name": "Cuboid Colony",
    "manaCost": "{G}{U}",
    "colors": [
        "G",
        "U"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Insect"
    ],
    "keywords": ["Flash", "Flying", "Trample"],
    "oracleText": "Flash\nFlying, trample\nIncrement (Whenever you cast a spell, if the amount of mana you spent is greater than this creature's power or toughness, put a +1/+1 counter on this creature.)",
    "abilities": [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastSpell,
            triggerCondition: 'PLAYER_IS_CONTROLLER && SPENT_MANA_GT_POWER_OR_TOUGHNESS',
            effects: [
                { type: EffectType.AddCounters, amount: 1, startingCounters: { type: '+1/+1', amount: 1 }, targetMapping: TargetMapping.Self }
            ]
        }
    ],
    "power": "1",
    "toughness": "1"
};
