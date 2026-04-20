import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const TempleOfEpiphany: CardDefinition = {
    name: "Temple of Epiphany",
    manaCost: "",
    scryfall_id: "00f9ba77-e389-417d-ad4a-719c3021d744",
    image_url: "https://cards.scryfall.io/normal/front/0/0/00f9ba77-e389-417d-ad4a-719c3021d744.jpg?1594737817",
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
    ]
};
