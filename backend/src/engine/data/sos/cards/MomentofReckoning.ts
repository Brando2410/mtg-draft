import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
export const MomentofReckoning: CardDefinition = {
    name: "Moment of Reckoning",
    manaCost: "{3}{W}{W}{B}{B}",
    scryfall_id: "577d9dc8-7720-4dc9-b650-64b4729b309b",
    rarity: "rare",
    image_url: "https://cards.scryfall.io/normal/front/5/7/577d9dc8-7720-4dc9-b650-64b4729b309b.jpg?1775938423",
    colors: ["B", "W"],
    types: ["Sorcery"],
    subtypes: [],
    keywords: [],
    oracleText: "Choose up to four. You may choose the same mode more than once.\n• Destroy target nonland permanent.\n• Return target nonland permanent card from your graveyard to the battlefield.",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: CostType.Choice,
                    minChoices: 1,
                    maxChoices: 4,
                    choices: [
                        {
                            label: "Destroy target nonland permanent (Slot 1)",
                            targetDefinition: { type: TargetType.NonlandPermanent, count: 1, restrictions: [] },
                            effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.Target1 }]
                        },
                        {
                            label: "Destroy target nonland permanent (Slot 2)",
                            targetDefinition: { type: TargetType.NonlandPermanent, count: 1, restrictions: [] },
                            effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.Target2 }]
                        },
                        {
                            label: "Destroy target nonland permanent (Slot 3)",
                            targetDefinition: { type: TargetType.NonlandPermanent, count: 1, restrictions: [] },
                            effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.Target3 }]
                        },
                        {
                            label: "Destroy target nonland permanent (Slot 4)",
                            targetDefinition: { type: TargetType.NonlandPermanent, count: 1, restrictions: [] },
                            effects: [{ type: EffectType.Destroy, targetMapping: TargetMapping.Target4 }]
                        },
                        {
                            label: "Return target nonland permanent card (Slot 1)",
                            targetDefinition: {
                                type: TargetType.CardInGraveyard, count: 1, restrictions: [
                                    "nonland",
                                    "Permanent"
                                ]
                            },
                            effects: [{ type: EffectType.PutOnBattlefield, targetMapping: TargetMapping.Target5 }]
                        },
                        {
                            label: "Return target nonland permanent card (Slot 2)",
                            targetDefinition: {
                                type: TargetType.CardInGraveyard, count: 1, restrictions: [
                                    "nonland",
                                    "Permanent"
                                ]
                            },
                            effects: [{ type: EffectType.PutOnBattlefield, targetMapping: TargetMapping.Target6 }]
                        },
                        {
                            label: "Return target nonland permanent card (Slot 3)",
                            targetDefinition: {
                                type: TargetType.CardInGraveyard, count: 1, restrictions: [
                                    "nonland",
                                    "Permanent"
                                ]
                            },
                            effects: [{ type: EffectType.PutOnBattlefield, targetMapping: TargetMapping.Target7 }]
                        },
                        {
                            label: "Return target nonland permanent card (Slot 4)",
                            targetDefinition: {
                                type: TargetType.CardInGraveyard, count: 1, restrictions: [
                                    "nonland",
                                    "Permanent"
                                ]
                            },
                            effects: [{ type: EffectType.PutOnBattlefield, targetMapping: TargetMapping.Target8 }]
                        }
                    ]
                }
            ]
        }
    ]
};
