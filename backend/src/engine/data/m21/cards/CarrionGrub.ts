import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const CarrionGrub: CardDefinition = {
    name: "Carrion Grub",
    manaCost: "{3}{B}",

    oracleText: "Carrion Grub's power is equal to the greatest power among creature cards in your graveyard.\nWhen Carrion Grub enters the battlefield, mill four cards.",
    colors: ["B"],
    types: ["Creature"],
    subtypes: ["Insect", "Horror"],
    power: "0",
    toughness: "5",
    abilities: [
        {
            type: AbilityType.Static,
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                layer: 7,
                powerSet: DynamicAmount.GreatestPowerInYourGraveyard,
                targetMapping: TargetMapping.Self
            }]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [{
                type: EffectType.Mill,
                amount: 4,
                targetMapping: TargetMapping.Controller
            }]
        }
    ],
    scryfall_id: "31df3d95-bbdb-449d-9601-4fa844c3c640",
    image_url: "https://cards.scryfall.io/normal/front/3/1/31df3d95-bbdb-449d-9601-4fa844c3c640.jpg?1594736036",
    rarity: "uncommon"
};

