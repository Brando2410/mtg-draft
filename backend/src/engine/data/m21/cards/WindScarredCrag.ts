import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const WindScarredCrag: CardDefinition = {
    name: "Wind-Scarred Crag",
    manaCost: "",
    scryfall_id: "cc3f0607-e54d-451e-b816-5b3f81e3da62",
    image_url: "https://cards.scryfall.io/normal/front/c/c/cc3f0607-e54d-451e-b816-5b3f81e3da62.jpg?1594737901",
    oracleText: "Wind-Scarred Crag enters the battlefield tapped.\nWhen Wind-Scarred Crag enters the battlefield, you gain 1 life.\n{T}: Add {R} or {W}.",
    colors: [],
    types: ["Land"],
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
        }
    ]
};
