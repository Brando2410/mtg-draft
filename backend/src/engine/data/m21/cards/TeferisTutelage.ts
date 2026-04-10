import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const TeferisTutelage: Record<string, ImplementableCard> = {
    "Teferi's Tutelage": {
        name: "Teferi's Tutelage",
        manaCost: "{2}{U}",
        oracleText: "When this enchantment enters, draw a card, then discard a card.\nWhenever you draw a card, target opponent mills two cards.",
        colors: ["blue"],
        supertypes: [],
        types: ["Enchantment"],
        subtypes: [],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "teferi_tutelage_etb",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.data?.object?.id === source.sourceId,
                effects: [{ type: 'DrawCards', amount: 1, targetMapping: 'CONTROLLER' }, { type: 'DiscardCards', amount: 1, targetMapping: 'CONTROLLER' }]
            },
            {
                id: "teferi_tutelage_draw_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_DRAW',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.playerId === source.controllerId,
                effects: [{ type: 'Mill', amount: 2, targetMapping: 'EACH_OPPONENT' }]
            }
        ]
    }
};
