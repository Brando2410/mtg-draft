import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const TranquilCove: CardDefinition = {
    name: "Tranquil Cove",
    manaCost: "",
    scryfall_id: "ef172e73-9828-4ad0-b86a-75a7fc4d2625",
    image_url: "https://cards.scryfall.io/normal/front/e/f/ef172e73-9828-4ad0-b86a-75a7fc4d2625.jpg?1594737890",
    oracleText: "Tranquil Cove enters the battlefield tapped.\nWhen Tranquil Cove enters the battlefield, you gain 1 life.\n{T}: Add {W} or {U}.",
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
                        { label: '{W}', effects: [{ type: EffectType.AddMana, manaType: 'W' }] },
                        { label: '{U}', effects: [{ type: EffectType.AddMana, manaType: 'U' }] }
                    ]
                }
            ]
        }
    ]
};
