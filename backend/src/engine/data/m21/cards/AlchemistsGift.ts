import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const AlchemistsGift: Record<string, ImplementableCard> = {
    "Alchemist's Gift": {
        name: "Alchemist's Gift",
        manaCost: "{B}",
        oracleText: "Target creature gets +1/+1 and gains your choice of deathtouch or lifelink until end of turn. (Any amount of damage a creature with deathtouch deals to a creature is enough to destroy it. Damage dealt by a creature with lifelink also causes its controller to gain that much life.)",
        colors: ["black"],
        supertypes: [],
        types: ["Instant"],
        subtypes: [],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "alchemist_gift_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature'] },
                effects: [
                    { type: 'ApplyContinuousEffect', powerModifier: 1, toughnessModifier: 1, duration: 'UNTIL_END_OF_TURN', layer: 7, targetMapping: 'TARGET_1' },
                    {
                        type: 'Choice',
                        label: 'Choose a keyword',
                        choices: [
                            { label: 'Deathtouch', effects: [{ type: 'ApplyContinuousEffect', duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['Deathtouch'], layer: 6, targetMapping: 'TARGET_1' }] },
                            { label: 'Lifelink', effects: [{ type: 'ApplyContinuousEffect', duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['Lifelink'], layer: 6, targetMapping: 'TARGET_1' }] }
                        ]
                    }
                ]
            }
        ]
    }
};
