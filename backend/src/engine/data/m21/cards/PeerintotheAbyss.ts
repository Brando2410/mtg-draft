import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const PeerintotheAbyss: Record<string, ImplementableCard> = {
    "Peer into the Abyss": {
        name: "Peer into the Abyss",
        manaCost: "{4}{B}{B}{B}",
        oracleText: "Target player draws cards equal to half the number of cards in their library and loses half their life. Round up each time.",
        colors: ["black"],
        supertypes: [],
        types: ["Sorcery"],
        subtypes: [],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "peer_into_abyss_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                targetDefinition: { type: 'Player', count: 1 },
                effects: [
                    { type: 'DrawCards', amount: 'HALF_LIBRARY_ROUND_UP', targetMapping: 'TARGET_1' },
                    { type: 'LoseLife', amount: 'HALF_LIFE_ROUND_UP', targetMapping: 'TARGET_1' }
                ]
            }
        ]
    }
};
