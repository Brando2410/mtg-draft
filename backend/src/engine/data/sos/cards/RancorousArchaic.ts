import { AbilityType, CardDefinition, DynamicAmount, EffectType, TriggerEvent } from '@shared/engine_types';
    export const RancorousArchaic: CardDefinition = {
    name: "Rancorous Archaic",
    manaCost: "{5}",
    colors: [],
    types: [
        "Creature"
    ],
    subtypes: [
        "Avatar"
    ],
    keywords: [
        "Trample",
        "Reach"
    ],
    oracleText: "Trample, reach\nConverge — This creature enters with a +1/+1 counter on it for each color of mana spent to cast it.",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
            effects: [
                {
                    type: EffectType.EntersWithCounters,
                    counterType: '+1/+1',
                    amount: DynamicAmount.ConvergeAmount
                }
            ]
        }
    ],
    power: "2",
    toughness: "2",
    scryfall_id: "2565e16a-ed31-4867-adb8-f1633d580397",
    image_url: "https://cards.scryfall.io/normal/front/2/5/2565e16a-ed31-4867-adb8-f1633d580397.jpg?1775936927",
    rarity: "common"
};

