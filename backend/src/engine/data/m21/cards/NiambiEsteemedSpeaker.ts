import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const NiambiEsteemedSpeaker: Record<string, ImplementableCard> = {
    "Niambi, Esteemed Speaker": {
        name: "Niambi, Esteemed Speaker",
        manaCost: "{W}{U}",
        oracleText: "Flash\nWhen Niambi enters, you may return another target creature you control to its owner's hand. If you do, you gain life equal to that creature's mana value.\n{1}{W}{U}, {T}, Discard a legendary card: Draw two cards.",
        colors: ["blue","white"],
        supertypes: ["Legendary"],
        types: ["Creature"],
        subtypes: ["Human","Cleric"],
        power: "2",
        toughness: "1",
        keywords: [],
        abilities: [
            {
                id: "niambi_etb_bounce",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => {
                    return event.data?.object?.id === source.sourceId;
                },
                targetDefinition: { type: 'Permanent', count: 1, optional: true, restrictions: ['Creature', 'Legendary', 'YouControl', 'Other'] },
                effects: [{ type: 'ReturnToHand', targetMapping: 'TARGET_1' }, { type: 'GainLife', amount: 'TARGET_1_CMC', targetMapping: 'CONTROLLER' }],
                oracleText: "When Niambi, Esteemed Speaker enters the battlefield, you may return another target legendary creature you control to its owner's hand. If you do, you gain life equal to that creature's mana value."
            },
            {
                id: "niambi_discard_draw",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Mana', value: '{1}{W}{U}' }, { type: 'Tap', value: null }, { type: 'Discard', restrictions: ['Legendary', 'Card'] }],
                effects: [{ type: 'DrawCards', amount: 2, targetMapping: 'CONTROLLER' }]
            }
        ]
    }
};
