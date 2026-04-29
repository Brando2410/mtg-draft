import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
export const PracticedOffense: CardDefinition = {
    name: "Practiced Offense",
    manaCost: "{2}{W}",
    scryfall_id: "79c7cf94-c0a1-432d-90d7-7f0599c2e7a8",
    rarity: "rare",
    image_url: "https://cards.scryfall.io/normal/front/7/9/79c7cf94-c0a1-432d-90d7-7f0599c2e7a8.jpg?1775937087",
    colors: [
        "W"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: ["Flashback"],
    oracleText: "Put a +1/+1 counter on each creature target player controls. Target creature gains your choice of double strike or lifelink until end of turn.\nFlashback {1}{W} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
    flashbackCost: "{1}{W}",

    abilities: [
        {
            type: AbilityType.Spell,
            flashbackCost: "{1}{W}",
            targetDefinition: [
                {
                    type: TargetType.Player,
                    count: 1,
                },
                {
                    type: TargetType.Creature,
                    count: 1,
                }
            ],
            effects: [
                {
                    type: EffectType.AddCounters,
                    counterType: '+1/+1',
                    amount: 1,
                    targetMapping: 'ALL_CREATURES_CONTROLLED_BY_TARGET_1'
                },
                {
                    type: EffectType.Choice,
                    label: "Choose a keyword",
                    targetMapping: TargetMapping.Controller,
                    choices: [
                        {
                            label: "Double Strike",
                            effects: [
                                {
                                    type: EffectType.ApplyContinuousEffect,
                                    duration: { type: DurationType.UntilEndOfTurn },
                                    abilitiesToAdd: ['Double Strike'],
                                    targetMapping: TargetMapping.Target2
                                }
                            ]
                        },
                        {
                            label: "Lifelink",
                            effects: [
                                {
                                    type: EffectType.ApplyContinuousEffect,
                                    duration: { type: DurationType.UntilEndOfTurn },
                                    abilitiesToAdd: ['Lifelink'],
                                    targetMapping: TargetMapping.Target2
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ],
};

