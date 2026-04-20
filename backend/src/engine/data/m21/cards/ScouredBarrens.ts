import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const ScouredBarrens: CardDefinition = {
    name: "Scoured Barrens",
    manaCost: "",
    scryfall_id: "0290bb38-4e89-497d-beef-13e6d60ed013",
    image_url: "https://cards.scryfall.io/normal/front/0/2/0290bb38-4e89-497d-beef-13e6d60ed013.jpg?1594737664",
    oracleText: "Scoured Barrens enters the battlefield tapped.\nWhen Scoured Barrens enters the battlefield, you gain 1 life.\n{T}: Add {W} or {B}.",
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
                        { label: '{B}', effects: [{ type: EffectType.AddMana, manaType: 'B' }] }
                    ]
                }
            ]
        }
    ]
};
