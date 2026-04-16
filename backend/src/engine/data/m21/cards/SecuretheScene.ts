import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const SecuretheScene: CardDefinition = {
    name: "Secure the Scene",
    manaCost: "{4}{W}",
    oracleText: "Exile target nonland permanent. Its controller creates a 1/1 white Soldier creature token.",
    colors: ["W"],
    types: ["Sorcery"],
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                type: TargetType.NonlandPermanent,
                count: 1
            },
            effects: [
                { type: EffectType.Exile, targetMapping: TargetMapping.Target1 },
                {
                    type: EffectType.CreateToken,
                    tokenBlueprint: {
                        name: 'Soldier',
                        power: 1,
                        toughness: 1,
                        colors: ['W'],
                        types: ['Creature'],
                        subtypes: ['Soldier']
                    },
                    targetMapping: TargetMapping.Target1Controller
                }
            ]
        }
    ]
};


