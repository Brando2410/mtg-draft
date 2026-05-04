import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
export const InfirmaryHealerStreamofLife: CardDefinition = {
    name: "Infirmary Healer // Stream of Life",
    manaCost: "{1}{G}",
    scryfall_id: "911442e3-3003-4683-a766-e791e9553667",
    rarity: "uncommon",
    image_url: "https://cards.scryfall.io/normal/front/9/1/911442e3-3003-4683-a766-e791e9553667.jpg?1775938036",
    colors: ["G"],
    types: ["Creature"],
    subtypes: ["Cat", "Cleric"],
    keywords: ["Prepared"],
    oracleText: "This creature enters prepared.",
    power: "2",
    toughness: "3",

    entersPrepared: true,
    preparedFace: {
        name: "Stream of Life",
        image_url: "https://cards.scryfall.io/png/front/3/4/341aa1b2-e600-4580-b0cd-e1582b75dc81.png?1562733506",
        manaCost: "{X}{G}",
        colors: ["G"],
        types: ["Sorcery"],
        oracleText: "Target player gains X life.",
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinitions: [{
                    type: TargetType.Player,
                    count: 1
                }],
                effects: [
                    {
                        type: EffectType.GainLife,
                        amount: DynamicAmount.X,
                        targetMapping: TargetMapping.Target1
                    }
                ]
            }
        ]
    }
};

