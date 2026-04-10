import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const TeferiMasterofTime: Record<string, ImplementableCard> = {
    "Teferi, Master of Time": {
        name: "Teferi, Master of Time",
        manaCost: "{2}{U}{U}",
        oracleText: "You may activate loyalty abilities of Teferi, Master of Time on any player's turn any time you could cast an instant.\n+1: Draw a card, then discard a card.\n−3: Target creature an opponent controls phases out.\n−10: Take two extra turns after this one.",
        colors: ["blue"],
        supertypes: ["Legendary"],
        types: ["Planeswalker"],
        subtypes: ["Teferi"],
        power: undefined,
        toughness: undefined,
        keywords: [],
        loyalty: "3",
        abilities: [
            {
                id: "teferi_master_any_turn",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [{ type: 'AllowOutOfTurnActivation', targetMapping: 'SELF' }]
            },
            {
                id: "teferi_master_plus_1",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: '+1' }],
                effects: [{ type: 'DrawCards', amount: 1, targetMapping: 'CONTROLLER' }, { type: 'DiscardCards', amount: 1, targetMapping: 'CONTROLLER' }]
            },
            {
                id: "teferi_master_minus_3",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: '-3' }],
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature', 'OpponentControl'] },
                effects: [{ type: 'PhasedOut', value: true, targetMapping: 'TARGET_1' }]
            },
            {
                id: "teferi_master_minus_10",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: '-10' }],
                effects: [{ type: 'ExtraTurns', amount: 2, targetMapping: 'CONTROLLER' }]
            }
        ]
    }
};
