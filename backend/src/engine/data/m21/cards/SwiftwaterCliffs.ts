import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const SwiftwaterCliffs: CardDefinition = {
    name: "Swiftwater Cliffs",
    manaCost: "",

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
    ],
    scryfall_id: "ca53fb19-b8ca-485b-af1a-5117ae54bfe3",
    image_url: "https://cards.scryfall.io/normal/front/c/a/ca53fb19-b8ca-485b-af1a-5117ae54bfe3.jpg?1743205059",
    rarity: "common"
};

