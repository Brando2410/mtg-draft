import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const AngelicAscension: CardDefinition = {
    name: "Angelic Ascension",
    manaCost: "{1}{W}",
    oracleText: "Exile target creature or planeswalker. Its controller creates a 4/4 white Angel creature token with flying.",
    colors: ["W"],
    supertypes: [],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: { type: TargetType.CreatureOrPlaneswalker, count: 1 },
            effects: [
                { type: EffectType.Exile, targetMapping: TargetMapping.Target1 },
                { type: EffectType.CreateToken, tokenBlueprint: { name: 'Angel', power: '4', toughness: '4', colors: ['W'], types: ['Creature'], subtypes: ['Angel'], keywords: ['Flying'] }, targetMapping: TargetMapping.Target1Controller }
            ]
        }
    ]
};

