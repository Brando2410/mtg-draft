import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, DynamicAmount } from '@shared/engine_types';

export const StealtheShow: CardDefinition = {
    name: "Steal the Show",
    manaCost: "{2}{R}",
    scryfall_id: "721a7dc8-7720-4dc9-b650-64b4729b309b",
    rarity: "rare",
    image_url: "https://cards.scryfall.io/normal/front/7/2/721a7dc8-7720-4dc9-b650-64b4729b309b.jpg?1775938423",
    colors: ["R"],
    types: ["Sorcery"],
    subtypes: [],
    keywords: [],
    oracleText: "Choose one or both —\n• Target player discards any number of cards, then draws that many cards.\n• Steal the Show deals damage equal to the number of instant and sorcery cards in your graveyard to target creature or planeswalker.",
    abilities: [
        {
            type: AbilityType.Spell,
            minChoices: 1,
            maxChoices: 2,
            modes: [
                {
                    label: "Target player discards any number, then draws that many cards.",
                    targetDefinition: {
                        type: TargetType.Player,
                        count: 1
                    },
                    effects: [
                        {
                            type: EffectType.DiscardCards,
                            amount: 'ANY',
                            targetMapping: TargetMapping.Target1
                        },
                        {
                            type: EffectType.DrawCards,
                            amount: DynamicAmount.DiscardedCount,
                            targetMapping: TargetMapping.Target1
                        }
                    ]
                },
                {
                    label: "Deal damage equal to instant/sorcery in your graveyard to target creature or planeswalker.",
                    targetDefinition: {
                        type: TargetType.CreatureOrPlaneswalker,
                        count: 1
                    },
                    effects: [
                        {
                            type: EffectType.DealDamage,
                            amount: 'INSTANT_SORCERY_IN_GRAVEYARD_COUNT',
                            targetMapping: TargetMapping.Target1
                        }
                    ]
                }
            ]
        }
    ]
};
