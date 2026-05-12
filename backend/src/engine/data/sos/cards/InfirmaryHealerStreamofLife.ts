import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
export const InfirmaryHealerStreamofLife: CardDefinition = {
    name: "Infirmary Healer // Stream of Life",
    manaCost: "{1}{G}",
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
        ],

    },
    scryfall_id: "911442e3-3003-4683-a766-e791e9553667",
    image_url: "https://cards.scryfall.io/normal/front/9/1/911442e3-3003-4683-a766-e791e9553667.jpg?1775938036",
    rarity: "uncommon"
};

