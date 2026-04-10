import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const GarrukUnleashed: Record<string, ImplementableCard> = {
    "Garruk, Unleashed": {
        name: "Garruk, Unleashed",
        manaCost: "{2}{G}{G}",
        oracleText: "+1: Up to one target creature gets +3/+3 and gains trample until end of turn.\n−2: Create a 3/3 green Beast creature token. Then if an opponent controls more creatures than you, put a loyalty counter on Garruk.\n−7: You get an emblem with \"At the beginning of your end step, you may search your library for a creature card, put it onto the battlefield, then shuffle.\"",
        colors: ["green"],
        supertypes: ["Legendary"],
        types: ["Planeswalker"],
        subtypes: ["Garruk"],
        power: undefined,
        toughness: undefined,
        keywords: [],
        loyalty: "4",
        abilities: [
            {
                id: "garruk_unleashed_plus_1",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Mana', value: '+1' }],
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature'] },
                effects: [{ type: 'ApplyContinuousEffect', duration: 'UNTIL_END_OF_TURN', powerModifier: 3, toughnessModifier: 3, abilitiesToAdd: ['Trample'], layer: 7, targetMapping: 'TARGET_1' }]
            },
            {
                id: "garruk_unleashed_minus_2",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Mana', value: '-2' }],
                effects: [{
                    type: 'CreateToken',
                    tokenBlueprint: { name: 'Beast', power: '3', toughness: '3', colors: ['G'], types: ['Creature'], subtypes: ['Beast'] },
                    targetMapping: 'CONTROLLER'
                }]
            }
        ]
    }
};
