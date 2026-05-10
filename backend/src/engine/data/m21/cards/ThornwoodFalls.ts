import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const ThornwoodFalls: CardDefinition = {
    name: "Thornwood Falls",
    manaCost: "",

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
    ],
    scryfall_id: "ebb502c2-5fd0-46a9-b77d-010f4a942056",
    image_url: "https://cards.scryfall.io/normal/front/e/b/ebb502c2-5fd0-46a9-b77d-010f4a942056.jpg?1743205064",
    rarity: "common"
};

