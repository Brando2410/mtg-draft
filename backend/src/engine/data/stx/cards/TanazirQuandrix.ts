import { AbilityType, CardDefinition, ConditionType, DurationType, DynamicAmount, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const TanazirQuandrix: CardDefinition = {
    name: "Tanazir Quandrix",
    manaCost: "{3}{G}{U}",
    scryfall_id: "957117fe-ddc9-4c5d-bff8-f74602a24dd8",
    image_url: "https://cards.scryfall.io/normal/front/9/5/957117fe-ddc9-4c5d-bff8-f74602a24dd8.jpg?1681169173",
    colors: ["G", "U"],
    supertypes: ["Legendary"],
    types: ["Creature"],
    subtypes: ["Elder", "Dragon"],
    power: "4",
    toughness: "4",
    keywords: ["Flying", "Trample"],
    oracleText: "Flying, trample. When Tanazir Quandrix enters the battlefield, choose target creature you control. Put a number of +1/+1 counters on it equal to Tanazir Quandrix's power. Whenever Tanazir Quandrix attacks, you may have the base power and toughness of other creatures you control become Tanazir Quandrix's power and toughness until end of turn.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            targetDefinitions: [{ count: 1, type: TargetType.Creature, restrictions: [Restriction.YouControl] }],
            effects: [{ type: EffectType.AddCounters, counterType: 'p1p1', amount: DynamicAmount.SourcePower, targetMapping: TargetMapping.Target1 }]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Attack,
            condition: ConditionType.SelfAttacks,
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                duration: { type: DurationType.UntilEndOfTurn },
                optional: true,
                targetMapping: TargetMapping.OtherCreaturesYouControl,
                powerSet: DynamicAmount.SourcePower,
                toughnessSet: DynamicAmount.SourceToughness
            }]
        }
    ]
};
