import { AbilityType, CardDefinition, EffectType, TargetMapping } from '@shared/engine_types';
    export const GerminationPracticum: CardDefinition = {
    name: "Germination Practicum",
    manaCost: "{3}{G}{G}",
    colors: [
        "G"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [
        "Lesson"
    ],
    keywords: [],
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
                },
                { type: EffectType.Paradigm }
            ]
        }
    ]
};
    