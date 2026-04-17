import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';
    export const ImprovisationCapstone: CardDefinition = {
    name: "Improvisation Capstone",
    manaCost: "{5}{R}{R}",
    colors: [
        "R"
    ],
    types: [
        "Sorcery"
    ],
    subtypes: [
        "Lesson"
    ],
    keywords: [],
    oracleText: "Exile cards from the top of your library until you exile cards with total mana value 4 or greater. You may cast any number of spells from among them without paying their mana costs.\nParadigm (Then exile this spell. After you first resolve a spell with this name, you may cast a copy of it from exile without paying its mana cost at the beginning of each of your first main phases.)",
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [
                {
                    type: EffectType.ExileUntilManaValue,
                    amount: 4,
                    targetMapping: TargetMapping.Controller
                },
                {
                    type: EffectType.Paradigm,
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ]
};
    
