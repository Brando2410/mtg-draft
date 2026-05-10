import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const JungleHollow: CardDefinition = {
    name: "Jungle Hollow",
    manaCost: "",

    oracleText: "Jungle Hollow enters the battlefield tapped.\nWhen Jungle Hollow enters the battlefield, you gain 1 life.\n{T}: Add {B} or {G}.",
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
                        { label: '{B}', effects: [{ type: EffectType.AddMana, manaType: 'B' }] },
                        { label: '{G}', effects: [{ type: EffectType.AddMana, manaType: 'G' }] }
                    ]
                }
            ]
        }
    ],
    scryfall_id: "ea13440b-3f7b-4182-9541-27c1fa3121e5",
    image_url: "https://cards.scryfall.io/normal/front/e/a/ea13440b-3f7b-4182-9541-27c1fa3121e5.jpg?1743205019",
    rarity: "common"
};

