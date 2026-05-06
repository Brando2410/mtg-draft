import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const BloodfellCaves: CardDefinition = {
    name: "Bloodfell Caves",
    manaCost: "",
    scryfall_id: "5d89a0e2-1163-4a11-b0df-deef2e6c8108",
    image_url: "https://cards.scryfall.io/normal/front/5/d/5d89a0e2-1163-4a11-b0df-deef2e6c8108.jpg?1594737607",
    oracleText: "Bloodfell Caves enters the battlefield tapped.\nWhen Bloodfell Caves enters the battlefield, you gain 1 life.\n{T}: Add {B} or {R}.",
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
            id: "{T}: Add {B} or {R}",
            type: AbilityType.Activated,
            costs: [{ type: CostType.Tap }],
            isManaAbility: true,
            effects: [
                {
                    type: EffectType.AddMana,
                    choices: [
                        { label: '{R}', effects: [{ type: EffectType.AddMana, manaType: 'R' }] },
                        { label: '{B}', effects: [{ type: EffectType.AddMana, manaType: 'B' }] }
                    ]
                }
            ]
        }
    ]
};
