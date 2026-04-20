import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const ThornwoodFalls: CardDefinition = {
    name: "Thornwood Falls",
    manaCost: "",
    scryfall_id: "ef1350a4-e9ed-4d40-9a3d-c12484b39178",
    image_url: "https://cards.scryfall.io/normal/front/e/f/ef1350a4-e9ed-4d40-9a3d-c12484b39178.jpg?1594737878",
    oracleText: "Thornwood Falls enters the battlefield tapped.\nWhen Thornwood Falls enters the battlefield, you gain 1 life.\n{T}: Add {G} or {U}.",
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
                        { label: '{G}', effects: [{ type: EffectType.AddMana, manaType: 'G' }] },
                        { label: '{U}', effects: [{ type: EffectType.AddMana, manaType: 'U' }] }
                    ]
                }
            ]
        }
    ]
};
