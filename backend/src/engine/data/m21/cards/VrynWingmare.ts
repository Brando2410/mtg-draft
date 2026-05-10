import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping } from '@shared/engine_types';

export const VrynWingmare: CardDefinition = {
    name: "Vryn Wingmare",
    manaCost: "{2}{W}",
    oracleText: "Flying\nNoncreature spells cost {1} more to cast.",
    colors: ["W"],
    types: ["Creature"],
    subtypes: ["Pegasus"],
    power: "2",
    toughness: "1",
    keywords: ["Flying"],
    abilities: [
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.SpellTax,
                    amount: 1,
                    restrictions: [Restriction.NonCreature],
                    targetMapping: TargetMapping.EachPlayer
                }
            ]
        }
    ],
    scryfall_id: "17b59819-4746-4c67-b6e5-4157d498a065",
    image_url: "https://cards.scryfall.io/normal/front/1/7/17b59819-4746-4c67-b6e5-4157d498a065.jpg?1594735361",
    rarity: "uncommon"
};

