import { AbilityType, CardDefinition, CostType, DurationType, EffectType, Restriction, TargetMapping, TargetType, Zone } from '@shared/engine_types';

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
            costs: [{ type: CostType.SacrificeSelf }],
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
    ],
    scryfall_id: "6911759c-7177-402c-a95a-f9f46efaf521",
    image_url: "https://cards.scryfall.io/normal/front/6/9/6911759c-7177-402c-a95a-f9f46efaf521.jpg?1594735224",
    rarity: "uncommon"
};

