import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
export const ThunderdrumSoloist: CardDefinition = {
    name: "Thunderdrum Soloist",
    manaCost: "{1}{R}",
    colors: ["R"],
    types: ["Creature"],
    subtypes: ["Dwarf", "Bard"],
    power: "1",
    toughness: "3",
    keywords: ["Reach"],
    oracleText: "Reach\nOpus — Whenever you cast an instant or sorcery spell, this creature deals 1 damage to each opponent. If five or more mana was spent to cast that spell, this creature deals 3 damage to each opponent instead.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastInstantOrSorcery,
            condition: ConditionType.PlayerIsController,
            effects: [
                {
                    type: EffectType.DealDamage,
                    amount: 3,
                    condition: 'SPENT_MANA_GE:5',
                    targetMapping: TargetMapping.EachOpponent,
                    damageSourceMapping: TargetMapping.Self
                },
                {
                    type: EffectType.DealDamage,
                    amount: 1,
                    condition: 'SPENT_MANA_LT:5',
                    targetMapping: TargetMapping.EachOpponent,
                    damageSourceMapping: TargetMapping.Self
                }
            ]
        }
    ]
};
