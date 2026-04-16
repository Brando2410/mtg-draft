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
    image_url: "https://cards.scryfall.io/png/front/3/4/34949019-2f88-4447-b648-5226bedf569a.png?1775937905",
    preparedFace: {
        name: "Careful Study",
        image_url: "https://cards.scryfall.io/png/front/d/e/dea15b53-2940-40e7-8d48-8ec11341da83.png?1562936545",
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
    