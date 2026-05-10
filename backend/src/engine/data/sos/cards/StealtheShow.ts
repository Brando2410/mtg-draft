import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, DynamicAmount } from '@shared/engine_types';

export const StealtheShow: CardDefinition = {
    name: "Steal the Show",
    manaCost: "{2}{R}",
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
                    label: "Target player discards any number of cards, then draws that many.",
                    targetDefinitions: [{
                        type: TargetType.Player,
                        count: 1
                    }],
                    effects: [
                        {
                            type: EffectType.DiscardCards,
                            amount: 'ANY',
                            label: "Discard cards",
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
                    targetDefinitions: [{
                        type: TargetType.CreatureOrPlaneswalker,
                        count: 1
                    }],
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
    ],
    scryfall_id: "7ac6649f-980e-4404-9c05-458c30578ecc",
    image_url: "https://cards.scryfall.io/normal/front/7/a/7ac6649f-980e-4404-9c05-458c30578ecc.jpg?1775937875",
    rarity: "rare"
};

