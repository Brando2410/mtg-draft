import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const PrimalMight: Record<string, ImplementableCard> = {
    "Primal Might": {
        name: "Primal Might",
        manaCost: "{X}{G}",
        oracleText: "Target creature you control gets +X/+X until end of turn. Then it fights up to one target creature you don't control. (Each deals damage equal to its power to the other.)",
        colors: ["green"],
        supertypes: [],
        types: ["Sorcery"],
        subtypes: [],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "primal_might_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                costs: [{ type: 'Mana', value: '{X}{G}' }],
                targetDefinition: { type: 'Permanent', count: 2, restrictions: ['Creature', 'YouControl', 'Creature', 'OpponentControl'] },
                effects: [
                    { type: 'ApplyContinuousEffect', duration: 'UNTIL_END_OF_TURN', powerModifier: 'X', toughnessModifier: 'X', layer: 7, targetMapping: 'TARGET_1' },
                    { type: 'Fight', targetMapping: 'TARGET_1', target2Mapping: 'TARGET_2' }
                ]
            }
        ]
    }
};
