import { AbilityType, CardDefinition, ConditionType, CostType, DurationType, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const DelugeVirtuoso: CardDefinition = {
    name: "Deluge Virtuoso",
    manaCost: "{2}{U}",


    colors: ["U"],
    types: ["Creature"],
    subtypes: ["Human", "Wizard"],
    keywords: [],
    power: "2",
    toughness: "2",
    oracleText: "When Deluge Virtuoso enters, tap target creature an opponent controls and put a stun counter on it. (If a permanent with a stun counter would become untapped, remove one from it instead.)\nOpus — Whenever you cast an instant or sorcery spell, this creature gets +1/+1 until end of turn. If five or more mana was spent to cast that spell, this creature gets +2/+2 until end of turn instead.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            targetDefinitions: [{
                type: TargetType.Creature,
                count: 1,
                restrictions: [Restriction.OpponentControl]
            }],
            effects: [
                {
                    type: CostType.Tap,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.AddCounters,
                    counterType: 'stun',
                    amount: 1,
                    targetMapping: TargetMapping.Target1
                }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastInstantOrSorcery,
            condition: ConditionType.PlayerIsController,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    condition: 'SPENT_MANA_GE:5',
                    duration: { type: DurationType.UntilEndOfTurn },
                    powerModifier: 2,
                    toughnessModifier: 2,
                    targetMapping: TargetMapping.Self
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    condition: 'SPENT_MANA_LT:5',
                    duration: { type: DurationType.UntilEndOfTurn },
                    powerModifier: 1,
                    toughnessModifier: 1,
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
    scryfall_id: "2e3b16ed-8727-48fd-8b1f-c0cbd329385e",
    image_url: "https://cards.scryfall.io/normal/front/2/e/2e3b16ed-8727-48fd-8b1f-c0cbd329385e.jpg?1775937202",
    rarity: "common"
};

