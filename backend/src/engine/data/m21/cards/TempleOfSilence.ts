import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const TempleOfSilence: CardDefinition = {
    name: "Temple of Silence",
    manaCost: "",
    scryfall_id: "46700877-62f7-410c-99d8-9df21e42a98f",
    image_url: "https://cards.scryfall.io/normal/front/4/6/46700877-62f7-410c-99d8-9df21e42a98f.jpg?1594737854",
    oracleText: "Temple of Silence enters the battlefield tapped.\nWhen Temple of Silence enters the battlefield, scry 1.\n{T}: Add {W} or {B}.",
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
                        { label: '{W}', effects: [{ type: EffectType.AddMana, manaType: 'W' }] },
                        { label: '{B}', effects: [{ type: EffectType.AddMana, manaType: 'B' }] }
                    ]
                }
            ]
        }
    ]
};
