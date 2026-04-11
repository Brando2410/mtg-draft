import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const LilianaWakeroftheDead: Record<string, ImplementableCard> = {
    "Liliana, Waker of the Dead": {
        name: "Liliana, Waker of the Dead",
        manaCost: "{2}{B}{B}",
        oracleText: "+1: Each player discards a card. Each opponent who can't loses 3 life.\n−3: Target creature gets -X/-X until end of turn, where X is the number of cards in your graveyard.\n−7: You get an emblem with \"At the beginning of combat on your turn, put target creature card from a graveyard onto the battlefield under your control. It gains haste.\"",
        colors: ["black"],
        supertypes: ["Legendary"],
        types: ["Planeswalker"],
        subtypes: ["Liliana"],
        power: undefined,
        toughness: undefined,
        keywords: [],
        loyalty: "4",
        abilities: [
            {
                id: "liliana_waker_plus_1",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: '+1' }],
                effects: [
                    { 
                        type: EffectType.DiscardCards, 
                        amount: 1, 
                        targetMapping: 'EACH_PLAYER',
                        onFailureEffects: [
                            { type: EffectType.LoseLife, amount: 3, condition: 'TARGET_IS_OPPONENT', targetMapping: 'TARGET_1' }
                        ]
                    }
                ]
            },
            {
                id: "liliana_waker_minus_3",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: '-3' }],
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature'] },
                effects: [{ 
                    type: EffectType.ApplyContinuousEffect, 
                    duration: 'UNTIL_END_OF_TURN', 
                    layer: 7, 
                    powerModifier: (state: any, source: any) => -(state.players[source.controllerId]?.graveyard.length || 0), 
                    toughnessModifier: (state: any, source: any) => -(state.players[source.controllerId]?.graveyard.length || 0), 
                    targetMapping: 'TARGET_1' 
                }]
            },
            {
                id: "liliana_waker_minus_7",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: '-7' }],
                effects: [{ type: 'CreateToken', tokenBlueprint: { name: 'Liliana Emblem', power: '', toughness: '', colors: ['B'], types: ['Emblem'], subtypes: ['Liliana'], keywords: [], oracleText: 'At the beginning of combat on your turn, put target creature card from a graveyard onto the battlefield under your control. It gains haste.' }, targetMapping: 'CONTROLLER' }]
            }
        ]
    }
};
