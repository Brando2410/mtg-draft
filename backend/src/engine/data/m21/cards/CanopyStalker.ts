import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const CanopyStalker: CardDefinition = {
    name: "Canopy Stalker",
    manaCost: "{3}{G}",
    oracleText: "Canopy Stalker must be blocked if able.\nWhen Canopy Stalker dies, you gain 1 life for each creature that died this turn.",
    colors: ["G"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Cat"],
    power: "4",
    toughness: "2",
    abilities: [
        {
            type: AbilityType.Static,
            effects: [{
                type: EffectType.CombatConstraint,
                restrictions: [{ type: 'MustBeBlocked' }]
            }]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Death,
            condition: 'SelfDied',
            effects: [{ 
                type: EffectType.GainLife, 
                amount: DynamicAmount.CreaturesDiedThisTurnCount, 
                targetMapping: TargetMapping.Controller 
            }]
        }
    ]
};
