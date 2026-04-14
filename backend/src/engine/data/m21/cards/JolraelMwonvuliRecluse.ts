import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const JolraelMwonvuliRecluse: Record<string, ImplementableCard> = {
    "Jolrael, Mwonvuli Recluse": {
        name: "Jolrael, Mwonvuli Recluse",
        manaCost: "{1}{G}",
        oracleText: "Whenever you draw your second card each turn, create a 2/2 green Cat creature token.\n{4}{G}{G}: Until end of turn, creatures you control have base power and toughness X/X, where X is the number of cards in your hand.",
        colors: ["green"],
        supertypes: ["Legendary"],
        types: ["Creature"],
        subtypes: ["Human","Druid"],
        power: "1",
        toughness: "2",
        keywords: [],
        abilities: [
            {
                id: "jolrael_second_draw_trigger",
                type: AbilityType.Triggered,
                    eventMatch: 'ON_SECOND_DRAW',
                activeZone: ZoneRequirement.Battlefield,
                condition: (state: any, event: any, source: any) => event.playerId === source.controllerId,
                effects: [{
                    type: EffectType.CreateToken,
                    tokenBlueprint: {
                        name: 'Cat', power: '2', toughness: '2', colors: ['G'],
                        types: ['Creature'], subtypes: ['Cat'],
                        image_url: 'https://cards.scryfall.io/large/front/7/3/7332222a-69b1-40d9-96b1-40483980b5a6.jpg'
                    },
                    amount: 1,
                    targetMapping: 'CONTROLLER'
                }]
            },
            {
                id: "jolrael_activated_draw_buff",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Mana', value: '{4}{G}{G}' }],
                effects: [{
                    type: EffectType.ApplyContinuousEffect,
                    duration: 'UNTIL_END_OF_TURN',
                    powerSet: 'CARDS_IN_HAND_COUNT',
                    toughnessSet: 'CARDS_IN_HAND_COUNT',
                    layer: 7,
                    targetMapping: 'ALL_CREATURES_YOU_CONTROL'
                }]
            }
        ]
    }
};


