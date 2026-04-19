import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
export const GloriousDecay: CardDefinition = {
    name: "Glorious Decay",
    manaCost: "{1}{G}",
    scryfall_id: "a335f396-1004-4fee-842a-a35ff6ba17f2",
    rarity: "common",
    image_url: "https://cards.scryfall.io/normal/front/a/3/a335f396-1004-4fee-842a-a35ff6ba17f2.jpg?1775938023",
    colors: [
        "G"
    ],
    types: [
        "Instant"
    ],
    subtypes: [],
    keywords: [],
    oracleText: "Choose one —\n• Destroy target artifact.\n• Glorious Decay deals 4 damage to target creature with flying.\n• Exile target card from a graveyard. Draw a card.",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: CostType.Choice,
                    label: "Choose a mode",
                    choices: [
                        {
                            label: "Destroy target artifact",
                            targetDefinition: {
                                type: TargetType.Artifact,
                                count: 1,
                            },
                            effects: [
                                {
                                    type: EffectType.Destroy,
                                    targetMapping: TargetMapping.Target1
                                }
                            ]
                        },
                        {
                            label: "Deals 4 damage to target creature with flying",
                            targetDefinition: {
                                type: TargetType.Creature,
                                count: 1,
                                restrictions: ["flying"]
                            },
                            effects: [
                                {
                                    type: 'DealDamage' as any,
                                    amount: 4,
                                    targetMapping: TargetMapping.Target1
                                }
                            ]
                        },
                        {
                            label: "Exile target card from a graveyard. Draw a card",
                            targetDefinition: {
                                type: TargetType.CardInGraveyard,
                                count: 1
                            },
                            effects: [
                                {
                                    type: CostType.Exile,
                                    targetMapping: TargetMapping.Target1
                                },
                                {
                                    type: EffectType.DrawCards,
                                    targetMapping: TargetMapping.Controller,
                                    amount: 1
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};
