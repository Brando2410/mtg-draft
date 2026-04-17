import { AbilityType, CardDefinition, CostType, DurationType, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';


export const SelflessSavior: CardDefinition = {
    name: "Selfless Savior",
    manaCost: "{W}",
    oracleText: "Sacrifice Selfless Savior: Another target creature you control gains indestructible until end of turn.",
    colors: ["W"],
    types: ["Creature"],
    subtypes: ["Dog"],
    power: "1",
    toughness: "1",
    abilities: [
        {
            type: AbilityType.Activated,
            activeZone: Zone.Battlefield,
            costs: [{ type: CostType.Sacrifice, targetMapping: TargetMapping.Self }],
            targetDefinition: {
                type: TargetType.Creature,
                count: 1,
                restrictions: [
                { type: 'Identity', value: 'Another' },
                { type: 'Control', value: 'YouControl' }
            ]
            },
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    abilitiesToAdd: ['Indestructible'],
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};

