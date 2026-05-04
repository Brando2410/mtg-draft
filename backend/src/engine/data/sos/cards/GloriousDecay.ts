import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType } from '@shared/engine_types';
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
            modes: [
                {
                    label: "Destroy target artifact",
                    targetDefinitions: [{
                        type: TargetType.Artifact,
                        count: 1,
                    }],
                    effects: [
                        {
                            type: EffectType.Destroy,
                            targetMapping: TargetMapping.Target1
                        }
                    ]
                },
                {
                    label: "Deals 4 damage to target creature with flying",
                    targetDefinitions: [{
                        type: TargetType.Creature,
                        count: 1,
                        restrictions: [Restriction.Flying]
                    }],
                    effects: [
                        {
                            type: EffectType.DealDamage,
                            amount: 4,
                            targetMapping: TargetMapping.Target1
                        }
                    ]
                },
                {
                    label: "Exile target card from a graveyard. Draw a card",
                    type: EffectType.Choice,
                    targetDefinitions: [{
                        type: TargetType.CardInGraveyard,
                        count: 1
                    }],
                    effects: [
                        {
                            type: EffectType.Exile,
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


};
