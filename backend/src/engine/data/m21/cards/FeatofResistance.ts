import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const FeatofResistance: Record<string, ImplementableCard> = {
    "Feat of Resistance": {
        name: "Feat of Resistance",
        manaCost: "{1}{W}",
        oracleText: "Put a +1/+1 counter on target creature you control. It gains protection from the color of your choice until end of turn. (It can't be blocked, targeted, dealt damage, enchanted, or equipped by anything of that color.)",
        colors: ["white"],
        supertypes: [],
        types: ["Instant"],
        subtypes: [],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "feat_resistance_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature', 'YouControl'] },
                effects: [
                    { type: 'AddCounters', amount: 1, counterType: 'p1p1', targetMapping: 'TARGET_1' },
                    {
                        type: 'Choice', label: 'Choose a color', targetMapping: 'TARGET_1', choices: [
                            { label: 'White', effects: [{ type: 'ApplyContinuousEffect', duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['Protection from White'], layer: 6, targetMapping: 'TARGET_1' }] },
                            { label: 'Blue', effects: [{ type: 'ApplyContinuousEffect', duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['Protection from Blue'], layer: 6, targetMapping: 'TARGET_1' }] },
                            { label: 'Black', effects: [{ type: 'ApplyContinuousEffect', duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['Protection from Black'], layer: 6, targetMapping: 'TARGET_1' }] },
                            { label: 'Red', effects: [{ type: 'ApplyContinuousEffect', duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['Protection from Red'], layer: 6, targetMapping: 'TARGET_1' }] },
                            { label: 'Green', effects: [{ type: 'ApplyContinuousEffect', duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['Protection from Green'], layer: 6, targetMapping: 'TARGET_1' }] }
                        ]
                    }
                ]
            }
        ]
    }
};
