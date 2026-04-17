import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';
    export const TeachersPest: CardDefinition = {
    name: "Teacher's Pest",
    manaCost: "{B}{G}",
    colors: ["B", "G"],
    types: ["Creature"],
    subtypes: ["Pest"],
    keywords: ["Menace"],
    oracleText: "Menace\nWhenever this creature attacks, you gain 1 life.\n{B}{G}: Return this card from your graveyard to the battlefield tapped.",
    power: "1",
    toughness: "1",

    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Attack,
            effects: [
                { type: EffectType.GainLife, amount: 1, targetMapping: TargetMapping.Controller }
            ]
        },
        {
            type: AbilityType.Activated,
            activeZone: Zone.Graveyard,
            costs: [
                { type: CostType.Mana, value: '{B}{G}' }
            ],
            effects: [
                {
                    type: EffectType.MoveToZone,
                    zone: Zone.Battlefield,
                    targetMapping: TargetMapping.Self,
                    tapped: true
                }
            ]
        }
    ]
};
    
