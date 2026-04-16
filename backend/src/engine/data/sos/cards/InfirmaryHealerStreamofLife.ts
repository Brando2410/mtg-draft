import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const InfirmaryHealerStreamofLife: CardDefinition = {
    name: "Infirmary Healer // Stream of Life",
    manaCost: "{1}{G}",
    colors: ["G"],
    types: ["Creature"],
    subtypes: ["Cat", "Cleric"],
    power: "2",
    toughness: "3",
    keywords: ["Prepared"],
    oracleText: "This creature enters prepared.",
    entersPrepared: true,
    image_url: "https://cards.scryfall.io/png/front/9/1/911442e3-3003-4683-a766-e791e9553667.png?1775938036",

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
                targetDefinition: {
                    type: TargetType.Player,
                    count: 1
                },
                effects: [
                    {
                        type: EffectType.GainLife,
                        amount: "X",
                        targetMapping: TargetMapping.Target1
                    }
                ]
            }
        ]
    }
};

