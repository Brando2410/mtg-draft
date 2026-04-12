import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const DrowsingTyrannodon: Record<string, ImplementableCard> = {
    "Drowsing Tyrannodon": {
        name: "Drowsing Tyrannodon",
        manaCost: "{1}{G}",
        oracleText: "Defender (This creature can't attack.)\nAs long as you control a creature with power 4 or greater, this creature can attack as though it didn't have defender.",
        colors: ["green"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Dinosaur"],
        power: "3",
        toughness: "3",
        keywords: ["Defender"],
        abilities: [
            {
                id: "drowsing_tyrannodon_defender",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [{
                    type: EffectType.ApplyContinuousEffect,
                    layer: 6,
                    abilitiesToRemove: ['Defender'],
                    condition: 'HAS_PERMANENT:creature,youcontrol,power>=4',
                    targetMapping: 'SELF'
                }]
            }
        ]
    }
};
