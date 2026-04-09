import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const BurlfistOak: Record<string, ImplementableCard> = {
    "Burlfist Oak": {
        name: "Burlfist Oak",
        manaCost: "{2}{G}{G}",
        oracleText: "Whenever you draw a card, this creature gets +2/+2 until end of turn.",
        colors: ["green"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Treefolk"],
        power: "2",
        toughness: "3",
        keywords: [],
        abilities: [
            {
                id: "burlfist_oak_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_DRAW',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.playerId === source.controllerId,
                effects: [{ type: 'ApplyContinuousEffect', duration: 'UNTIL_END_OF_TURN', powerModifier: 2, toughnessModifier: 2, layer: 7, targetMapping: 'SELF' }]
            }
        ]
    }
};
