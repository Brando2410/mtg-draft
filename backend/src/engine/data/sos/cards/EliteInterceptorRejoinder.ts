import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const EliteInterceptorRejoinder: CardDefinition = {
    name: "Elite Interceptor",
    manaCost: "{W}",


    colors: ["W"],
    types: ["Creature"],
    subtypes: ["Human", "Wizard"],
    keywords: ["Prepared"],
    oracleText: "This creature enters prepared.",
    power: "1",
    toughness: "2",
    entersPrepared: true,
    preparedFace: {
        name: "Rejoinder",

        manaCost: "{1}{W}",
        colors: ["W"],
        types: ["Sorcery"],
        oracleText: "You may tap or untap target creature. Draw a card.",
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinitions: [{ type: TargetType.Creature, count: 1, optional: true }],
                effects: [
                    {
                        type: EffectType.Choice,
                        label: "Choose one:",
                        choices: [
                            {
                                label: "Tap target creature",
                                effects: [{ type: EffectType.Tap, targetMapping: TargetMapping.Target1 }]
                            },
                            {
                                label: "Untap target creature",
                                effects: [{ type: EffectType.Untap, targetMapping: TargetMapping.Target1 }]
                            }
                        ]
                    },
                    { type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller }
                ]
            }
        ],

    },
    scryfall_id: "2970683e-e69c-42cb-a067-34abd56fb42b",
    image_url: "https://cards.scryfall.io/png/front/2/9/2970683e-e69c-42cb-a067-34abd56fb42b.png?1775936992",
    rarity: "common"
};

