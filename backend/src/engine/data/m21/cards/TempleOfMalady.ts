import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const TempleOfMalady: CardDefinition = {
    name: "Temple of Malady",
    manaCost: "",
    scryfall_id: "92569762-cb05-4f40-a19c-88226068e820",
    image_url: "https://cards.scryfall.io/normal/front/9/2/92569762-cb05-4f40-a19c-88226068e820.jpg?1594737831",
    oracleText: "Temple of Malady enters the battlefield tapped.\nWhen Temple of Malady enters the battlefield, scry 1.\n{T}: Add {B} or {G}.",
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
                        { label: '{B}', effects: [{ type: EffectType.AddMana, manaType: 'B' }] },
                        { label: '{G}', effects: [{ type: EffectType.AddMana, manaType: 'G' }] }
                    ]
                }
            ]
        }
    ]
};
