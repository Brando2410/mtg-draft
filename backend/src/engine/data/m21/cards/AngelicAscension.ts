import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const AngelicAscension: CardDefinition = {
    name: "Angelic Ascension",
    manaCost: "{1}{W}",

    oracleText: "Exile target creature or planeswalker. Its controller creates a 4/4 white Angel creature token with flying.",
    colors: ["W"],
    types: ["Instant"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{ type: TargetType.CreatureOrPlaneswalker, count: 1 }],
            effects: [
                { type: EffectType.Exile, targetMapping: TargetMapping.Target1 },
                {
                    type: EffectType.CreateToken,
                    tokenBlueprint: {
                        name: 'Angel',
                        power: '4',
                        toughness: '4',
                        colors: ['W'],
                        types: ['Creature'],
                        subtypes: ['Angel'],
                        keywords: ['Flying'],

                    },
                    targetMapping: TargetMapping.Target1Controller
                }
            ]
        }
    ],
    scryfall_id: "e8cca776-b0e4-4cd2-815f-36c1f86cf497",
    image_url: "https://cards.scryfall.io/normal/front/e/8/e8cca776-b0e4-4cd2-815f-36c1f86cf497.jpg?1594734706",
    rarity: "uncommon"
};

