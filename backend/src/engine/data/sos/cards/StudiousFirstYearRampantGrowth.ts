import { CardDefinition, AbilityType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const StudiousFirstYearRampantGrowth: CardDefinition = {
    name: "Studious First-Year",
    manaCost: "{G}",
    colors: ["G"],
    types: ["Creature"],
    subtypes: ["Bear", "Wizard"],
    power: "1",
    toughness: "1",
    keywords: ["Prepared"],
    oracleText: "This creature enters prepared.",
    entersPrepared: true,

    preparedFace: {
        name: "Rampant Growth",
        manaCost: "{1}{G}",
        colors: ["G"],
        types: ["Sorcery"],
        oracleText: "Search your library for a basic land card, put that card onto the battlefield tapped, then shuffle.",
        abilities: [
            {
                type: AbilityType.Spell,
                effects: [
                    {
                        type: EffectType.SearchLibrary,
                        targetDefinition: {
                            type: TargetType.Land,
                            count: 1,
                            restrictions: ['Basic', 'Land']
                        }
                    },
                    {
                        type: EffectType.PutOnBattlefield,
                        targetMapping: TargetMapping.Target1,
                        tapped: true
                    },
                    {
                        type: EffectType.ShuffleLibrary,
                        targetMapping: TargetMapping.Controller
                    }
                ]
            }
        ]
    }
};
