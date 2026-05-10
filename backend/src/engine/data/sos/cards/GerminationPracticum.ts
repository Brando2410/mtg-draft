import { AbilityType, CardDefinition, EffectType, TargetMapping } from '@shared/engine_types';
export const GerminationPracticum: CardDefinition = {
    name: "Germination Practicum",
    manaCost: "{3}{G}{G}",


    colors: ["G"],
    types: ["Sorcery"],
    subtypes: ["Lesson"],
    keywords: ["Paradigm"],
    oracleText: "Put two +1/+1 counters on each creature you control.\nParadigm (Then exile this spell. After you first resolve a spell with this name, you may cast a copy of it from exile without paying its mana cost at the beginning of each of your first main phases.)",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.AddCounters,
                    amount: 2,
                    counterType: '+1/+1',
                    targetMapping: TargetMapping.AllCreaturesYouControl
                }
            ]
        }
    ],
    scryfall_id: "abe8332f-c76e-44e2-9427-d1228453abec",
    image_url: "https://cards.scryfall.io/normal/front/a/b/abe8332f-c76e-44e2-9427-d1228453abec.jpg?1775938016",
    rarity: "mythic"
};

