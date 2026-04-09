import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const BaneslayerAngel: Record<string, ImplementableCard> = {
    "Baneslayer Angel": {
        name: "Baneslayer Angel",
        manaCost: "{3}{W}{W}",
        oracleText: "Flying, first strike, lifelink, protection from Demons and from Dragons",
        colors: ["white"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Angel"],
        power: "5",
        toughness: "5",
        keywords: ["Flying"],
        abilities: [
            {
                id: "baneslayer_angel_protection",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [
                    { type: 'ApplyContinuousEffect', layer: 6, abilitiesToAdd: ['Protection from Demons'], targetMapping: 'SELF' },
                    { type: 'ApplyContinuousEffect', layer: 6, abilitiesToAdd: ['Protection from Dragons'], targetMapping: 'SELF' }
                ]
            }
        ]
    }
};
