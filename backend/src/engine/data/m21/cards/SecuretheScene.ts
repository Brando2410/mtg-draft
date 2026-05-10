import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const SecuretheScene: CardDefinition = {
    name: "Secure the Scene",
    manaCost: "{4}{W}",

    oracleText: "Exile target nonland permanent. Its controller creates a 1/1 white Soldier creature token.",
    colors: ["W"],
    types: ["Sorcery"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                type: TargetType.NonlandPermanent,
                count: 1
            }],
            effects: [
                { type: EffectType.Exile, targetMapping: TargetMapping.Target1 },
                {
                    type: EffectType.CreateToken,
                    tokenBlueprint: {
                        name: 'Soldier',
                        power: "1",
                        toughness: "1",
                        colors: ['W'],
                        types: ['Creature'],
                        subtypes: ['Soldier'],

                    },
                    targetMapping: TargetMapping.Target1Controller
                }
            ]
        }
    ],
    scryfall_id: "d6467d96-e43a-4b1e-b6ce-578d991077b5",
    image_url: "https://cards.scryfall.io/normal/front/d/6/d6467d96-e43a-4b1e-b6ce-578d991077b5.jpg?1594735209",
    rarity: "common"
};

