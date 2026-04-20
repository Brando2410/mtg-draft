import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const SwiftwaterCliffs: CardDefinition = {
    name: "Swiftwater Cliffs",
    manaCost: "",
    scryfall_id: "ef1f6308-4b7b-4837-97d8-348f9460517f",
    image_url: "https://cards.scryfall.io/normal/front/e/f/ef1f6308-4b7b-4837-97d8-348f9460517f.jpg?1594737803",
    oracleText: "Swiftwater Cliffs enters the battlefield tapped.\nWhen Swiftwater Cliffs enters the battlefield, you gain 1 life.\n{T}: Add {U} or {R}.",
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
                        { label: '{U}', effects: [{ type: EffectType.AddMana, manaType: 'U' }] },
                        { label: '{R}', effects: [{ type: EffectType.AddMana, manaType: 'R' }] }
                    ]
                }
            ]
        }
    ]
};
