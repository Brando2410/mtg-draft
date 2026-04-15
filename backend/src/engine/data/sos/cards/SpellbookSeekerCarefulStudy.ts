import { CardDefinition, AbilityType, EffectType, TargetMapping } from '@shared/engine_types';

export const SpellbookSeekerCarefulStudy: CardDefinition = {
    name: "Spellbook Seeker",
    manaCost: "{3}{U}",
    colors: ["U"],
    types: ["Creature"],
    subtypes: ["Bird", "Wizard"],
    power: "3",
    toughness: "3",
    keywords: ["Flying", "Prepared"],
    oracleText: "Flying\nThis creature enters prepared.",
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
        ]
    }
};
