import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent, CostType } from '@shared/engine_types';

export const DismalBackwater: CardDefinition = {

    name: "Dismal Backwater",
    manaCost: "",
    scryfall_id: "b3b1afa0-9bb5-4566-a85e-86a5c03e0187",
    image_url: "https://cards.scryfall.io/normal/front/b/3/b3b1afa0-9bb5-4566-a85e-86a5c03e0187.jpg?1594737627",
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



