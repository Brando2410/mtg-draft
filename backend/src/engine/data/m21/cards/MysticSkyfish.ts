import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType } from '@shared/engine_types';

export const MysticSkyfish: Record<string, ImplementableCard> = {
    "Mystic Skyfish": {
        name: "Mystic Skyfish",
        manaCost: "{2}{U}",
        oracleText: "Whenever you draw your second card each turn, Mystic Skyfish gains flying until end of turn.",
        colors: ["blue"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Fish"],
        power: "3",
        toughness: "1",
        keywords: [],
        abilities: [
            {
                id: "mystic_skyfish_draw_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_SECOND_DRAW',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.playerId === source.controllerId,
                effects: [{
                    type: EffectType.ApplyContinuousEffect,
                    duration: 'UNTIL_END_OF_TURN',
                    abilitiesToAdd: ['Flying'],
                    layer: 6,
                    targetMapping: 'SELF'
                }]
            }
        ]
    }
};
