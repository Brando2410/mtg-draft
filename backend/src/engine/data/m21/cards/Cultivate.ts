import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType, TargetMapping } from '@shared/engine_types';

export const Cultivate: Record<string, ImplementableCard> = {
    "Cultivate": {
        name: "Cultivate",
        manaCost: "{2}{G}",
        oracleText: "Search your library for up to two basic land cards, reveal those cards, put one onto the battlefield tapped and the other into your hand, then shuffle.",
        colors: ["G"],
        supertypes: [],
        types: ["Sorcery"],
        subtypes: [],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "cultivate_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                effects: [
                    {
                        type: EffectType.SearchLibrary,
                        targetDefinition: {
                            type: TargetType.Land,
                            count: 1,
                            minCount: 0,
                            restrictions: ['Basic']
                        },
                        zone: Zone.Battlefield,
                        tapped: true,
                        reveal: true,
                        targetMapping: TargetMapping.Controller
                    },
                    {
                        type: EffectType.SearchLibrary,
                        targetDefinition: {
                            type: TargetType.Land,
                            count: 1,
                            minCount: 0,
                            restrictions: ['Basic']
                        },
                        zone: Zone.Hand,
                        reveal: true,
                        targetMapping: TargetMapping.Controller
                    }
                ]
            }
        ]
    }
};
