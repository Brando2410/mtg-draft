import { AbilityType, CardDefinition, EffectType } from '@shared/engine_types';

export const HoptoIt: CardDefinition = {
    name: "Hop to It",
    manaCost: "{2}{W}",
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
                    tokenBlueprint: {
                        name: "Rabbit",
                        colors: ["W"],
                        types: ["Creature"],
                        subtypes: ["Rabbit"],
                        power: 1,
                        toughness: 1,
                        image_url: "https://cards.scryfall.io/normal/front/d/1/d1f88f28-09aa-468c-9aea-09aa6a388dee.jpg?1721424915"
                    }
                }
            ]
        }
    ],
    scryfall_id: "16fabbbf-e35b-468c-9aea-09aa6a388dee",
    image_url: "https://cards.scryfall.io/normal/front/1/6/16fabbbf-e35b-468c-9aea-09aa6a388dee.jpg?1775936394",
    rarity: "uncommon"
};

