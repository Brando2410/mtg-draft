import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const AngelicAscension: Record<string, ImplementableCard> = {
    "Angelic Ascension": {
        name: "Angelic Ascension",
        manaCost: "{1}{W}",
        oracleText: "Exile target creature or planeswalker. Its controller creates a 4/4 white Angel creature token with flying.",
        colors: ["white"],
        supertypes: [],
        types: ["Instant"],
        subtypes: [],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "angelic_ascension_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                targetDefinition: { type: 'Permanent', count: 1, restrictions: ['Creature', 'Planeswalker'] },
                effects: [
                    { type: 'Exile', targetMapping: 'TARGET_1' },
                    { type: 'CreateToken', tokenBlueprint: { name: 'Angel', power: '4', toughness: '4', colors: ['W'], types: ['Creature'], subtypes: ['Angel'], keywords: ['Flying'] }, targetMapping: 'TARGET_1_CONTROLLER' }
                ]
            }
        ]
    }
};
