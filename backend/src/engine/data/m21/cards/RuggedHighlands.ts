import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent, CostType } from '@shared/engine_types';

export const RuggedHighlands: CardDefinition = {

    name: "Rugged Highlands",
    manaCost: "",
    oracleText: "Rugged Highlands enters the battlefield tapped.\nWhen Rugged Highlands enters the battlefield, you gain 1 life.\n{T}: Add {R} or {G}.",
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
                        { label: '{G}', effects: [{ type: EffectType.AddMana, manaType: 'G' }] }
                    ]
                }
            ]
        },
    ]

};




