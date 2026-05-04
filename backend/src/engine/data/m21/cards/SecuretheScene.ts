import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const SecuretheScene: CardDefinition = {
    name: "Secure the Scene",
    manaCost: "{4}{W}",
    scryfall_id: "d45e0f51-7f49-41b1-a675-523e1e855737",
    image_url: "https://cards.scryfall.io/normal/front/d/4/d45e0f51-7f49-41b1-a675-523e1e855737.jpg?1594735168",
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
                        image_url: 'https://cards.scryfall.io/large/front/2/4/248286ca-6814-432c-9037-7c93cc588725.jpg?1595010997'
                    },
                    targetMapping: TargetMapping.Target1Controller
                }
            ]
        }
    ]
};
