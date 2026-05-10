import { AbilityType, CardDefinition, EffectType, TargetMapping } from '@shared/engine_types';

export const BaneslayerAngel: CardDefinition = {
    name: "Baneslayer Angel",
    manaCost: "{3}{W}{W}",

    oracleText: "Flying, first strike, lifelink, protection from Demons and from Dragons",
    colors: ["W"],
    types: ["Creature"],
    subtypes: ["Angel"],
    power: "5",
    toughness: "5",
    keywords: ["Flying", "First strike", "Lifelink"],
    abilities: [
        {
            type: AbilityType.Static,
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    abilitiesToAdd: ['Protection from Demons', 'Protection from Dragons'],
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
    scryfall_id: "4bd3014b-94bb-4a9f-92cf-239a2dcc7e97",
    image_url: "https://cards.scryfall.io/normal/front/4/b/4bd3014b-94bb-4a9f-92cf-239a2dcc7e97.jpg?1594734758",
    rarity: "mythic"
};

