import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const KirolHistoryBuffPackaPunch: CardDefinition = {
    name: "Kirol, History Buff // Pack a Punch",
    manaCost: "{R}{W}",
    colors: ["R", "W"],
    types: ["Legendary", "Creature"],
    subtypes: ["Vampire", "Cleric"],
    power: "2",
    toughness: "3",
    keywords: ["Prepared"],
    oracleText: "Whenever one or more cards leave your graveyard, Kirol becomes prepared. (While it's prepared, you may cast a copy of its spell. Doing so unprepares it.)",
    image_url: "https://cards.scryfall.io/png/front/6/7/676ba521-66e4-42cf-a315-70d03cb7334e.png?1775938375",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.LeaveGraveyard,
            condition: (state, event, trigger) => {
                return event.playerId === trigger.controllerId;
            },
            effects: [
                {
                    type: EffectType.Prepare,
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],

    preparedFace: {
        name: "Pack a Punch",
        image_url: "https://cards.scryfall.io/png/front/6/7/676ba521-66e4-42cf-a315-70d03cb7334e.png?1775938375",
        manaCost: "{1}{R}{W}",
        colors: ["R", "W"],
        types: ["Sorcery"],
        oracleText: "Mill a card. Put two +1/+1 counters on target creature. It gains trample until end of turn.",
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinition: {
                    type: TargetType.Creature,
                    count: 1,
                },
                effects: [
                    { type: EffectType.Mill, amount: 1, targetMapping: TargetMapping.Controller },
                    { type: EffectType.AddCounters, counterType: 'p1p1', amount: 2, targetMapping: TargetMapping.Target1 },
                    {
                        type: EffectType.ApplyContinuousEffect,
                        abilitiesToAdd: ["Trample"],
                        duration: { type: DurationType.UntilEndOfTurn },
                        targetMapping: TargetMapping.Target1
                    }
                ]
            }
        ]
    }
};

