import { AbilityType, ZoneRequirement, ImplementableCard } from '@shared/engine_types';

export const BasriDevotedPaladin: Record<string, ImplementableCard> = {
    "Basri, Devoted Paladin": {
        name: "Basri, Devoted Paladin",
        manaCost: "{4}{W}{W}",
        oracleText: "+1: Put a +1/+1 counter on up to one target creature. It gains vigilance until end of turn.\n−1: Whenever a creature attacks this turn, put a +1/+1 counter on it.\n−6: Creatures you control get +2/+2 and gain flying until end of turn.",
        colors: ["white"],
        supertypes: ["Legendary"],
        types: ["Planeswalker"],
        subtypes: ["Basri"],
        power: undefined,
        toughness: undefined,
        keywords: [],
        loyalty: "4",
        abilities: [
            {
                id: "basri_devoted_plus_1",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: '+1' }],
                targetDefinition: { type: 'Permanent', count: 1, optional: true, restrictions: ['Creature'] },
                effects: [
                    { type: 'AddCounters', amount: 1, value: '+1/+1', targetMapping: 'TARGET_1' },
                    { type: 'ApplyContinuousEffect', duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['Vigilance'], layer: 6, targetMapping: 'TARGET_1' }
                ]
            },
            {
                id: "basri_devoted_minus_1",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: '-1' }],
                effects: [
                    {
                        type: 'AddTriggeredAbility',
                        eventMatch: 'ON_ATTACK',
                        duration: 'UNTIL_END_OF_TURN',
                        effects: [{ type: 'AddCounters', targetMapping: 'EVENT_TARGET', value: '+1/+1', amount: 1 }]
                    }
                ]
            },
            {
                id: "basri_devoted_minus_6",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Loyalty', value: '-6' }],
                effects: [
                    {
                        type: 'ApplyContinuousEffect',
                        powerModifier: 2,
                        toughnessModifier: 2,
                        abilitiesToAdd: ['Flying'],
                        duration: 'UNTIL_END_OF_TURN',
                        layer: 6,
                        targetMapping: 'ALL_CREATURES_YOU_CONTROL'
                    },
                    {
                        type: 'ApplyContinuousEffect',
                        powerModifier: 2,
                        toughnessModifier: 2,
                        duration: 'UNTIL_END_OF_TURN',
                        layer: 7,
                        targetMapping: 'ALL_CREATURES_YOU_CONTROL'
                    }
                ]
            }
        ]
    }
};
