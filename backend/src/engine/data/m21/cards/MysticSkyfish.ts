import { AbilityType, ZoneRequirement, EffectType, TriggerEvent, DurationType, TargetMapping, CardDefinition } from '@shared/engine_types';

export const MysticSkyfish: CardDefinition = {

    name: "Mystic Skyfish",
    manaCost: "{2}{U}",
    oracleText: "Whenever you draw your second card each turn, Mystic Skyfish gains flying until end of turn.",
    colors: ["U"],
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
            eventMatch: TriggerEvent.SecondDraw,
            activeZone: ZoneRequirement.Battlefield,
            condition: (state: any, event: any, source: any) => event.playerId === source.controllerId,
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                duration: DurationType.UntilEndOfTurn,
                abilitiesToAdd: ['Flying'],
                layer: 6,
                targetMapping: TargetMapping.Self
            }]
        }
    ]

};


