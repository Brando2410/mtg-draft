import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent, CostType } from '@shared/engine_types';

export const DismalBackwater: CardDefinition = {

    name: "Dismal Backwater",
    manaCost: "",
    oracleText: "Dismal Backwater enters the battlefield tapped.\nWhen Dismal Backwater enters the battlefield, you gain 1 life.\n{T}: Add {U} or {B}.",
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
                        { label: '{U}', effects: [{ type: EffectType.AddMana, manaType: 'U' }] },
                        { label: '{B}', effects: [{ type: EffectType.AddMana, manaType: 'B' }] }
                    ]
                }
            ]
        },
    ]

};



