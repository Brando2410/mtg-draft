import { CardDefinition, AbilityType, EffectType, TriggerEvent, TargetMapping, DurationType } from '@shared/engine_types';

export const AdditiveEvolution: CardDefinition = {
    "name": "Additive Evolution",
    "manaCost": "{3}{G}{G}",
    "colors": [
        "G"
    ],
    "types": [
        "Enchantment"
    ],
    "subtypes": [],
    "oracleText": "When this enchantment enters, create a 0/0 green and blue Fractal creature token. Put three +1/+1 counters on it.\nAt the beginning of combat on your turn, put a +1/+1 counter on target creature you control. It gains vigilance until end of turn.",
    "abilities": [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.CreateToken,
                    tokenBlueprint: {
                        name: 'Fractal',
                        types: ['Creature'],
                        subtypes: ['Fractal'],
                        colors: ['G', 'U'],
                        power: '0',
                        toughness: '0',
                        image_url: 'https://cards.scryfall.io/png/front/9/1/910f48ab-b04e-4874-b31d-a86a7bc5af14.png?1682693894'
                    },
                    amount: 1
                },
                {
                    type: EffectType.AddCounters,
                    targetMapping: 'LAST_CREATED_TOKEN',
                    amount: 3,
                    value: 'p1p1'
                }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.BeginningOfCombatStep,
            condition: 'IS_YOUR_TURN',
            targetDefinition: { type: 'Creature', controller: 'player' },
            effects: [
                { type: EffectType.AddCounters, amount: 1, value: 'p1p1', targetMapping: TargetMapping.Target1 },
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: TargetMapping.Target1,
                    abilitiesToAdd: ['Vigilance'],
                    duration: DurationType.UntilEndOfTurn
                }
            ]
        }
    ]
};



