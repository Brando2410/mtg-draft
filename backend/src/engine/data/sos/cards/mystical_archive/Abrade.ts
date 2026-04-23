import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, Restriction } from '@shared/engine_types';

export const Abrade: CardDefinition = {
    name: "Abrade",
    manaCost: "{1}{R}",
    scryfall_id: "c5bb5307-e874-42c4-b85d-06b9f6c474c8",
    rarity: "uncommon",
    image_url: "https://cards.scryfall.io/normal/front/c/5/c5bb5307-e874-42c4-b85d-06b9f6c474c8.jpg?1775936634",
    colors: ["R"],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    oracleText: "Choose one —\n• Abrade deals 3 damage to target creature.\n• Destroy target artifact.",
    set: "soa",
    abilities: [
        {
            type: AbilityType.Spell,
            isModal: true,
            modes: [
                {
                    label: "Abrade deals 3 damage to target creature",
                    effects: [
                        {
                            type: EffectType.DealDamage,
                            amount: 3,
                            targetMapping: TargetMapping.Target1
                        }
                    ],
                    targetDefinition: {
                        type: TargetType.Creature,
                        count: 1
                    }
                },
                {
                    label: "Destroy target artifact",
                    effects: [
                        {
                            type: EffectType.Destroy,
                            targetMapping: TargetMapping.Target1
                        }
                    ],
                    targetDefinition: {
                        type: TargetType.Artifact,
                        count: 1
                    }
                }
            ]
        }
    ]
};
