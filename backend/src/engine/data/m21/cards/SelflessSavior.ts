import { AbilityType, CardDefinition, CostType, DurationType, EffectType, Restriction, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const SelflessSavior: CardDefinition = {
    name: "Selfless Savior",
    manaCost: "{W}",
    scryfall_id: "69172445-6615-4243-9843-d214c18011c2",
    image_url: "https://cards.scryfall.io/normal/front/6/9/69172445-6615-4243-9843-d214c18011c2.jpg?1594735176",
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
            targetDefinitions: [{
                type: TargetType.Creature,
                count: 1,
                restrictions: [Restriction.Other, Restriction.YouControl]
            }],
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
