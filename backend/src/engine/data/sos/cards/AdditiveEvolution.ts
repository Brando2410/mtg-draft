import { AbilityType, CardDefinition, ConditionType, DurationType, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';
export const AdditiveEvolution: CardDefinition = {
    name: "Additive Evolution",
    manaCost: "{3}{G}{G}",
    colors: ["G"],
    types: ["Enchantment"],
    subtypes: [],
    keywords: [],
    oracleText: "When this enchantment enters, create a 0/0 green and blue Fractal creature token. Put three +1/+1 counters on it.\nAt the beginning of combat on your turn, put a +1/+1 counter on target creature you control. It gains vigilance until end of turn.",
    abilities: [
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
                        image_url: "https://cards.scryfall.io/normal/front/d/e/de564776-9d88-4533-8717-842eecdd0594.jpg?1775828279"
                    },
                    amount: 1
                },
                {
                    type: EffectType.AddCounters,
                    targetMapping: TargetMapping.LastCreatedToken,
                    amount: 3,
                    counterType: '+1/+1'
                }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.BeginningOfCombatStep,
            condition: ConditionType.IsYourTurn,
            targetDefinitions: [{ type: TargetType.Creature, restrictions: [Restriction.YouControl] }],
            effects: [
                { type: EffectType.AddCounters, amount: 1, counterType: '+1/+1', targetMapping: TargetMapping.Target1 },
                {
                    type: EffectType.ApplyContinuousEffect,
                    targetMapping: TargetMapping.Target1,
                    abilitiesToAdd: ['Vigilance'],
                    duration: { type: DurationType.UntilEndOfTurn }
                }
            ]
        }
    ],
    scryfall_id: "b44ec684-d558-45eb-bcd6-8119428634c2",
    image_url: "https://cards.scryfall.io/normal/front/b/4/b44ec684-d558-45eb-bcd6-8119428634c2.jpg?1775937943",
    rarity: "uncommon"
};

