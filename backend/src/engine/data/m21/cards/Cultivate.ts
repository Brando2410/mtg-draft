import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const Cultivate: Record<string, ImplementableCard> = {
    "Cultivate": {
        name: "Cultivate",
        manaCost: "{2}{G}",
        oracleText: "Search your library for up to two basic land cards, reveal those cards, put one onto the battlefield tapped and the other into your hand, then shuffle.",
        colors: ["green"],
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
                        amount: 1,
                        destination: Zone.Battlefield,
                        tapped: true,
                        restrictions: ['BasicLand'],
                        reveal: true,
                        optional: true,
                        targetMapping: 'CONTROLLER'
                    },
                    {
                        type: EffectType.SearchLibrary,
                        amount: 1,
                        destination: Zone.Hand,
                        restrictions: ['BasicLand'],
                        reveal: true,
                        optional: true,
                        shuffle: true,
                        targetMapping: 'CONTROLLER'
                    }
                ]
            }
        ]
    }
};
