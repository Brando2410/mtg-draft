import { CardDefinition, AbilityType, TriggerEvent, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const NitaForumConciliator: CardDefinition = {
    "name": "Nita, Forum Conciliator",
    "manaCost": "{1}{W}{B}",
    "colors": [
        "B",
        "W"
    ],
    "types": [
        "Legendary",
        "Creature"
    ],
    "subtypes": [
        "Human",
        "Advisor"
    ],
    "oracleText": "Whenever you cast a spell you don't own, put a +1/+1 counter on each creature you control.\n{2}, Sacrifice another creature: Exile target instant or sorcery card from an opponent's graveyard. You may cast it this turn, and mana of any type can be spent to cast that spell. If that spell would be put into a graveyard, exile it instead. Activate only as a sorcery.",
    "abilities": [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastSpell,
            condition: 'EVENT_OBJECT_OWNER_NOT_YOU',
            effects: [
                {
                    type: EffectType.AddCounters,
                    counterType: 'p1p1',
                    amount: 1,
                    targetMapping: TargetMapping.AllCreaturesYouControl
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [
                { type: 'Mana', value: '{2}' },
                {
                    type: 'Sacrifice',
                    restrictions: ['Creature', 'Other']
                }
            ],
            targetDefinition: {
                type: TargetType.CardInGraveyard,
                count: 1,
                restrictions: [
                    'Opponent',
                    { type: 'Type', value: 'Instant' },
                    { type: 'Type', value: 'Sorcery', isOr: true }
                ]
            },
            effects: [
                {
                    type: EffectType.Exile,
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: { type: 'UNTIL_END_OF_TURN' as any },
                    targetMapping: TargetMapping.LastExiledObject,
                    sublayer: 'RulesChange',
                    canPlayExiled: true,
                    spendAnyMana: true,
                    redirectConditions: {
                        zone: Zone.Exile,
                        onLeaveZone: Zone.Graveyard
                    }
                }
            ],
            restriction: 'SORCERY_SPEED'
        }
    ],
    "power": "2",
    "toughness": "3"
};

