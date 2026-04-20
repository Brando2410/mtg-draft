import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const JungleHollow: CardDefinition = {
    name: "Jungle Hollow",
    manaCost: "",
    scryfall_id: "69f28d7a-6480-4725-9719-2354921e6410",
    image_url: "https://cards.scryfall.io/normal/front/6/9/69f28d7a-6480-4725-9719-2354921e6410.jpg?1594737643",
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
    ]
};
