import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const SanctumofStoneFangs: Record<string, ImplementableCard> = {
    "Sanctum of Stone Fangs": {
        name: "Sanctum of Stone Fangs",
        manaCost: "{1}{B}",
        oracleText: "At the beginning of your precombat main phase, each opponent loses X life and you gain X life, where X is the number of Shrines you control.",
        colors: ["black"],
        supertypes: ["Legendary"],
        types: ["Enchantment"],
        subtypes: ["Shrine"],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "sanctum_stone_fangs_trigger",
                type: AbilityType.Triggered,
                    eventMatch: 'ON_PRE_COMBAT_MAIN_PHASE_START',
                activeZone: ZoneRequirement.Battlefield,
                condition: (state: any, event: any, source: any) => event.playerId === source.controllerId,
                effects: [
                    { type: 'LoseLife', amount: 'COUNT_Shrine', targetMapping: 'OPPONENT' },
                    { type: 'GainLife', amount: 'COUNT_Shrine', targetMapping: 'CONTROLLER' }
                ]
            }
        ]
    }
};


