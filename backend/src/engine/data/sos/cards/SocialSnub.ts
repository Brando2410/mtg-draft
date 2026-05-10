import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const SocialSnub: CardDefinition = {
    name: "Social Snub",
    manaCost: "{1}{W}{B}",
    colors: ["B", "W"],
    types: ["Sorcery"],
    subtypes: [],
    keywords: [],
    oracleText: "When you cast this spell while you control a creature, you may copy this spell.\nEach player sacrifices a creature of their choice. Each opponent loses 1 life and you gain 1 life.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastSpell,
            condition: "CONTROL_COUNT_GE:creature,1",
            effects: [
                {
                    type: EffectType.Choice,
                    label: "You may copy Social Snub",
                    optional: true,
                    choices: [
                        {
                            label: "Yes, copy this spell",
                            effects: [
                                {
                                    type: EffectType.CopySpellOnStack,
                                    targetMapping: TargetMapping.Self
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.Sacrifice,
                    targetMapping: TargetMapping.EachPlayer,
                    restrictions: [
                        Restriction.Creature
                    ]
                },
                {
                    type: EffectType.LoseLife,
                    amount: 1,
                    targetMapping: TargetMapping.EachOpponent
                },
                {
                    type: EffectType.GainLife,
                    amount: 1,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ],
    scryfall_id: "a04b6900-0436-4920-a0d4-c0186d605ae3",
    image_url: "https://cards.scryfall.io/normal/front/a/0/a04b6900-0436-4920-a0d4-c0186d605ae3.jpg?1775938590",
    rarity: "uncommon"
};

