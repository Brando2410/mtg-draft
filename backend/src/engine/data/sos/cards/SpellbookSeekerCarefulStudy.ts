import { AbilityType, CardDefinition, EffectType, TargetMapping } from '@shared/engine_types';
export const SpellbookSeekerCarefulStudy: CardDefinition = {
    name: "Spellbook Seeker // Careful Study",
    manaCost: "{3}{U}",
    colors: ["U"],
    types: ["Creature"],
    subtypes: ["Bird", "Wizard"],
    keywords: ["Flying", "Prepared"],
    oracleText: "Flying\nThis creature enters prepared.",
    power: "3",
    toughness: "3",
    entersPrepared: true,
    preparedFace: {
        name: "Careful Study",

        manaCost: "{U}",
        colors: ["U"],
        types: ["Sorcery"],
        oracleText: "Draw two cards, then discard two cards.",
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [
                    {
                        type: EffectType.DrawCards,
                        amount: 2,
                        targetMapping: TargetMapping.Controller
                    },
                    {
                        type: EffectType.DiscardCards,
                        amount: 2,
                        targetMapping: TargetMapping.Controller
                    }
                ]
            }
        ],
    },
    scryfall_id: "cc44eaa4-59a4-419e-b1d1-d92f354ff588",
    image_url: "https://cards.scryfall.io/normal/front/c/c/cc44eaa4-59a4-419e-b1d1-d92f354ff588.jpg?1775937383",
    rarity: "common"
};

