import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
export const DigSiteInventory: CardDefinition = {
    name: "Dig Site Inventory",
    manaCost: "{W}",
    scryfall_id: "e52464ee-df8b-41ec-af93-4b0eb004383e",
    rarity: "common",
    image_url: "https://cards.scryfall.io/normal/front/e/5/e52464ee-df8b-41ec-af93-4b0eb004383e.jpg?1775936980",
    colors: [
        "W"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: [
        "Flashback"
    ],
    oracleText: "Put a +1/+1 counter on target creature you control. It gains vigilance until end of turn.\nFlashback {W} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
    flashbackCost: "{W}",

    abilities: [
        {
            type: AbilityType.Spell,
            flashbackCost: "{W}",
            targetDefinition: {
                type: TargetType.Creature, count: 1, restrictions: [
                    "youcontrol"
                ]
            },
            effects: [
                {
                    type: EffectType.AddCounters,
                    amount: 1,
                    startingCounters: { type: 'p1p1', amount: 1 },
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: { type: DurationType.UntilEndOfTurn },
                    abilitiesToAdd: ['Vigilance'],
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
