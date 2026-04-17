import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const CarrionGrub: CardDefinition = {
    name: "Carrion Grub",
    manaCost: "{3}{B}",
    oracleText: "Carrion Grub's power is equal to the greatest power among creature cards in your graveyard.\nWhen Carrion Grub enters the battlefield, mill four cards.",
    colors: ["B"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Insect", "Horror"],
    power: "0",
    toughness: "5",
    abilities: [
        {
            type: AbilityType.Static,
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                layer: 7,
                powerSet: DynamicAmount.GreatestPowerInYourGraveyard,
                targetMapping: TargetMapping.Self
            }]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [{
                type: EffectType.Mill,
                amount: 4,
                targetMapping: TargetMapping.Controller
            }]
        }
    ]
};
