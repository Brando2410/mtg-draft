import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const TempleOfMystery: CardDefinition = {
    name: "Temple of Mystery",
    manaCost: "",
    scryfall_id: "e03779e4-5390-482a-a92c-62bdae1ce013",
    image_url: "https://cards.scryfall.io/normal/front/e/0/e03779e4-5390-482a-a92c-62bdae1ce013.jpg?1594737841",
    oracleText: "Temple of Mystery enters the battlefield tapped.\nWhen Temple of Mystery enters the battlefield, scry 1.\n{T}: Add {G} or {U}.",
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
                        { label: '{G}', effects: [{ type: EffectType.AddMana, manaType: 'G' }] },
                        { label: '{U}', effects: [{ type: EffectType.AddMana, manaType: 'U' }] }
                    ]
                }
            ]
        }
    ]
};
