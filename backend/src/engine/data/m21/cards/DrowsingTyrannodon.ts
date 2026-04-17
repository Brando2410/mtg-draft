import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const DrowsingTyrannodon: CardDefinition = {

    name: "Drowsing Tyrannodon",
    manaCost: "{1}{G}",
    oracleText: "Defender (This creature can't attack.)\nAs long as you control a creature with power 4 or greater, this creature can attack as though it didn't have defender.",
    colors: ["G"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Dinosaur"],
    power: "3",
    toughness: "3",
    keywords: ["Defender"],
    abilities: [
        {
            type: AbilityType.Static,
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                layer: 6,
                abilitiesToRemove: ['Defender'],
                condition: 'HAS_PERMANENT:creature,youcontrol,power>=4',
                targetMapping: TargetMapping.Self
            }]
        }
    ]

};


