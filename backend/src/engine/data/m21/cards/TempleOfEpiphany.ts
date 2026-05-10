import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const TempleOfEpiphany: CardDefinition = {
    name: "Temple of Epiphany",
    manaCost: "",

    oracleText: "Temple of Epiphany enters the battlefield tapped.\nWhen Temple of Epiphany enters the battlefield, scry 1.\n{T}: Add {U} or {R}.",
    colors: [],
    types: ["Land"],
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
                        { label: '{U}', effects: [{ type: EffectType.AddMana, manaType: 'U' }] },
                        { label: '{R}', effects: [{ type: EffectType.AddMana, manaType: 'R' }] }
                    ]
                }
            ]
        }
    ],
    scryfall_id: "1652bb3c-c365-4046-b07e-3d861fa324c6",
    image_url: "https://cards.scryfall.io/normal/front/1/6/1652bb3c-c365-4046-b07e-3d861fa324c6.jpg?1594737690",
    rarity: "rare"
};

