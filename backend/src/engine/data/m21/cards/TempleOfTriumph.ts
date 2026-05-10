import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const TempleOfTriumph: CardDefinition = {
    name: "Temple of Triumph",
    manaCost: "",

    oracleText: "Temple of Triumph enters the battlefield tapped.\nWhen Temple of Triumph enters the battlefield, scry 1.\n{T}: Add {R} or {W}.",
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
                        { label: '{R}', effects: [{ type: EffectType.AddMana, manaType: 'R' }] },
                        { label: '{W}', effects: [{ type: EffectType.AddMana, manaType: 'W' }] }
                    ]
                }
            ]
        }
    ],
    scryfall_id: "d0e763f7-25b8-444f-8722-614297d0663f",
    image_url: "https://cards.scryfall.io/normal/front/d/0/d0e763f7-25b8-444f-8722-614297d0663f.jpg?1775942504",
    rarity: "rare"
};

