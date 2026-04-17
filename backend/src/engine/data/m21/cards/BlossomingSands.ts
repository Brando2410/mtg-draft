import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent, CostType } from '@shared/engine_types';

export const BlossomingSands: CardDefinition = {
    name: "Blossoming Sands",
    manaCost: "",
    oracleText: "Blossoming Sands enters the battlefield tapped.\nWhen Blossoming Sands enters the battlefield, you gain 1 life.\n{T}: Add {G} or {W}.",
    colors: [],
    supertypes: [],
    types: ["Land"],
    subtypes: [],
    entersTapped: true,
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [{ type: EffectType.GainLife, amount: 1, targetMapping: TargetMapping.Controller }]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Tap }],
            effects: [{ type: EffectType.AddMana, value: '{G}', amount: 1, targetMapping: TargetMapping.Controller }]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Tap }],
            effects: [{ type: EffectType.AddMana, value: '{W}', amount: 1, targetMapping: TargetMapping.Controller }]
        }
    ]
};
