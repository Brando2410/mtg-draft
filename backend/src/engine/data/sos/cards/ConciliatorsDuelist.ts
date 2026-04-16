import { AbilityType, CardDefinition, CostType, DurationType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
    export const ConciliatorsDuelist: CardDefinition = {
    name: "Conciliator's Duelist",
    manaCost: "{W}{W}{B}{B}",
    colors: [
        "B",
        "W"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Kor",
        "Warlock"
    ],
    keywords: [],
    oracleText: "When this creature enters, draw a card. Each player loses 1 life.\nRepartee — Whenever you cast an instant or sorcery spell that targets a creature, exile up to one target creature. Return that card to the battlefield under its owner's control at the beginning of the next end step.",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                { type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller },
                { type: EffectType.LoseLife, amount: 1, targetMapping: TargetMapping.EachPlayer }
            ]
        },
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.CastInstantOrSorcery,
            condition: 'PLAYER_IS_CONTROLLER && SPELL_TARGETS_CREATURE',
            effects: [
                {
                    type: CostType.Choice,
                    label: "Exile up to one target creature?",
                    choices: [
                        {
                            label: "Yes",
                            targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature'] },
                            effects: [
                                {
                                    type: CostType.Exile,
                                    targetMapping: TargetMapping.Target1,
                                    next: {
                                        type: EffectType.AddTriggeredAbility,
                    eventMatch: TriggerEvent.EndStep,
                                        duration: { type: DurationType.UntilEndOfTurn },
                                        effects: [{ type: EffectType.PutOnBattlefield, targetMapping: TargetMapping.Target1 }]
                                    }
                                }
                            ]
                        },
                        { label: "No", effects: [] }
                    ]
                }
            ]
        }
    ],
    power: "4",
    toughness: "3"
};
    