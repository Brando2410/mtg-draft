import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
export const DuelTactics: CardDefinition = {
    name: "Duel Tactics",
    manaCost: "{R}",
    scryfall_id: "8f3a1675-0cc7-4dfd-a12e-4740a2cf81e8",
    image_url: "https://cards.scryfall.io/normal/front/8/f/8f3a1675-0cc7-4dfd-a12e-4740a2cf81e8.jpg?1775937718",
    colors: [
        "R"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: [
        "Flashback"
    ],
    oracleText: "Duel Tactics deals 1 damage to target creature. It can't block this turn.\nFlashback {1}{R} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
    flashbackCost: "{1}{R}",

    abilities: [
        {
            type: AbilityType.Spell,
            flashbackCost: "{1}{R}",
            targetDefinition: { type: TargetType.Creature, count: 1 },
            effects: [
                { type: EffectType.DealDamage, amount: 1, targetMapping: TargetMapping.Target1 },
                {
                    type: EffectType.ApplyContinuousEffect,
                    duration: { type: DurationType.UntilEndOfTurn },
                    restrictions: [
                        { type: 'CannotBlock' }
                    ],
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
