import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
    export const ShopkeepersBane: CardDefinition = {
    name: "Shopkeeper's Bane",
    manaCost: "{2}{G}",
    colors: [
        "G"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Badger",
        "Pest"
    ],
    keywords: ["Trample"],
    oracleText: "Trample\nWhenever this creature attacks, you gain 2 life.",
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.Attack,
            effects: [
                { type: EffectType.GainLife, amount: 2, targetMapping: TargetMapping.Controller }
            ]
        }
    ],
    power: "4",
    toughness: "2",
    scryfall_id: "97f7fbb9-228c-4a74-975b-38d3b6cecb32",
    image_url: "https://cards.scryfall.io/normal/front/9/7/97f7fbb9-228c-4a74-975b-38d3b6cecb32.jpg?1775938087",
    rarity: "common"
};

