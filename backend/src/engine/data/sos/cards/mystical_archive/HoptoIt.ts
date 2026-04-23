import { AbilityType, CardDefinition, EffectType } from '@shared/engine_types';

export const HoptoIt: CardDefinition = {
    name: "Hop to It",
    manaCost: "{2}{W}",
    scryfall_id: "16fabbbf-e35b-468c-9aea-09aa6a388dee",
    rarity: "uncommon",
    image_url: "https://cards.scryfall.io/normal/front/1/6/16fabbbf-e35b-468c-9aea-09aa6a388dee.jpg?1775936394",
    colors: ["W"],
    types: ["Sorcery"],
    subtypes: [],
    keywords: [],
    oracleText: "Create three 1/1 white Rabbit creature tokens.",
    set: "soa",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.CreateToken,
                    amount: 3,
                    tokenDefinition: {
                        name: "Rabbit",
                        colors: ["W"],
                        types: ["Creature"],
                        subtypes: ["Rabbit"],
                        power: 1,
                        toughness: 1
                    }
                }
            ]
        }
    ]
};
