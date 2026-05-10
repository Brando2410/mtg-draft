import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const BlossomingSands: CardDefinition = {
    name: "Blossoming Sands",
    manaCost: "",

    oracleText: "Blossoming Sands enters the battlefield tapped.\nWhen Blossoming Sands enters the battlefield, you gain 1 life.\n{T}: Add {G} or {W}.",
    colors: [],
    types: ["Land"],
    entersTapped: true,
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.GainLife,
                    amount: 1,
                    targetMapping: TargetMapping.Controller
                }
            ]
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
                        { label: '{W}', effects: [{ type: EffectType.AddMana, manaType: 'W' }] }
                    ]
                }
            ]
        }
    ],
    scryfall_id: "c8483586-9a07-4f54-a390-7dd97fcea5cb",
    image_url: "https://cards.scryfall.io/normal/front/c/8/c8483586-9a07-4f54-a390-7dd97fcea5cb.jpg?1594737617",
    rarity: "common"
};

