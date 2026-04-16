import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent, CostType } from '@shared/engine_types';

export const TempleOfTriumph: CardDefinition = {

    name: "Temple of Triumph",
    manaCost: "",
    oracleText: "Temple of Triumph enters the battlefield tapped.\nWhen Temple of Triumph enters the battlefield, scry 1.\n{T}: Add {R} or {W}.",
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
            effects: [{ type: EffectType.Scry, amount: 1, targetMapping: TargetMapping.Controller }]
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
        }
    ]
};



