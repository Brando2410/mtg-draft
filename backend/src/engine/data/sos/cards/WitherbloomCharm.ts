import { AbilityType, CardDefinition, CostType, EffectType, Restriction, TargetMapping, TargetType } from '@shared/engine_types';

export const WitherbloomCharm: CardDefinition = {
    name: "Witherbloom Charm",
    manaCost: "{B}{G}",
    colors: ["B", "G"],
    types: ["Instant"],
    oracleText: "Choose one —\n• You may sacrifice a permanent. If you do, draw two cards.\n• You gain 5 life.\n• Destroy target nonland permanent with mana value 2 or less.",
    abilities: [
        {
            type: AbilityType.Spell,
            minChoices: 1,
            maxChoices: 1,
            modes: [
                {
                    label: "You may sacrifice a permanent. If you do, draw two cards.",
                    effects: [
                        {
                            type: EffectType.Choice,
                            label: "Sacrifice a permanent?",
                            choices: [
                                {
                                    label: "Yes",
                                    costs: [{ type: CostType.Sacrifice, restrictions: [Restriction.Permanent] }],
                                    effects: [
                                        {
                                            type: EffectType.DrawCards,
                                            amount: 2,
                                            targetMapping: TargetMapping.Controller
                                        }
                                    ]
                                },
                                { label: "No", effects: [] }
                            ]
                        }
                    ]
                },
                {
                    label: "You gain 5 life",
                    effects: [
                        {
                            type: EffectType.GainLife,
                            amount: 5,
                            targetMapping: TargetMapping.Controller
                        }
                    ]
                },
                {
                    label: "Destroy target nonland permanent with mana value 2 or less",
                    targetDefinitions: [{
                        type: TargetType.NonlandPermanent,
                        count: 1,
                        restrictions: [Restriction.ManaValue2OrLess]
                    }],
                    effects: [
                        {
                            type: EffectType.Destroy,
                            targetMapping: TargetMapping.Target1
                        }
                    ]
                }


            ]
        }
    ],
    scryfall_id: "254437f7-7a8a-4b11-9cea-e8e7ea23c59e",
    image_url: "https://cards.scryfall.io/normal/front/2/5/254437f7-7a8a-4b11-9cea-e8e7ea23c59e.jpg?1775938703",
    rarity: "uncommon"
};

