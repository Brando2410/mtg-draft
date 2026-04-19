import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const AngelicAscension: CardDefinition = {
    name: "Angelic Ascension",
    manaCost: "{1}{W}",
    scryfall_id: "e8cca776-b0e4-4cd2-815f-36c1f86cf497",
    image_url: "https://cards.scryfall.io/normal/front/e/8/e8cca776-b0e4-4cd2-815f-36c1f86cf497.jpg?1594734706",
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

