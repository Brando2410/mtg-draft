import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
export const MoltenNote: CardDefinition = {
    name: "Molten Note",
    manaCost: "{X}{R}{W}",
    scryfall_id: "506f69aa-7dc4-4dd7-990a-7371fc1762c0",
    rarity: "uncommon",
    image_url: "https://cards.scryfall.io/normal/front/5/0/506f69aa-7dc4-4dd7-990a-7371fc1762c0.jpg?1775938416",
    colors: [
        "R",
        "W"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [],
    keywords: ["Flashback"],
    oracleText: "Molten Note deals damage to target creature equal to the amount of mana spent to cast this spell. Untap all creatures you control.\nFlashback {6}{R}{W} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
    flashbackCost: "{6}{R}{W}",
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                type: TargetType.Creature,
                count: 1
            }],
            effects: [
                {
                    type: EffectType.DealDamage,
                    amount: 'EVENT_PAID_MANA',
                    targetMapping: TargetMapping.Target1
                },
                {
                    type: EffectType.Untap,
                    targetMapping: TargetMapping.AllCreaturesYouControl
                }
            ]
        }
    ]
};
