import { AbilityType, CardDefinition, EffectType, TargetMapping } from '@shared/engine_types';
export const SplatterTechnique: CardDefinition = {
    name: "Splatter Technique",
    manaCost: "{1}{U}{U}{R}{R}",
    colors: ["R", "U"],
    types: ["Sorcery"],
    subtypes: [],
    keywords: [],
    oracleText: "Choose one —\n• Draw four cards.\n• Splatter Technique deals 4 damage to each creature and planeswalker.",
    abilities: [
        {
            type: AbilityType.Spell,
            modes: [
                {

                    label: "Draw four cards",
                    effects: [
                        {
                            type: EffectType.DrawCards,
                            amount: 4,
                            targetMapping: TargetMapping.Controller
                        }
                    ]
                },
                {
                    label: "Deal 4 damage to each creature and planeswalker",
                    effects: [
                        {
                            type: EffectType.DealDamage,
                            amount: 4,
                            targetMapping: TargetMapping.AllCreaturesAndPlaneswalkers
                        }
                    ]
                }
            ]
        }
    ],
    scryfall_id: "969b6657-c3b9-47e1-a42e-95bbcccf452d",
    image_url: "https://cards.scryfall.io/normal/front/9/6/969b6657-c3b9-47e1-a42e-95bbcccf452d.jpg?1775938612",
    rarity: "rare"
};

