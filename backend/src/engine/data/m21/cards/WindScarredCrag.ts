import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const WindScarredCrag: CardDefinition = {

    name: "Wind-Scarred Crag",
    manaCost: "",
    oracleText: "Wind-Scarred Crag enters the battlefield tapped.\nWhen Wind-Scarred Crag enters the battlefield, you gain 1 life.\n{T}: Add {R} or {W}.",
    colors: [],
    supertypes: [],
    types: ["Land"],
    subtypes: [],
    keywords: [],
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
            isManaAbility: true,
            effects: [
                {
                    type: EffectType.AddMana,
                    choices: [
                        { label: '{R}', effects: [{ type: EffectType.AddMana, manaType: 'R' }] },
                        { label: '{W}', effects: [{ type: EffectType.AddMana, manaType: 'W' }] }
                    ]
                }
            ]
        },

    ]
};




