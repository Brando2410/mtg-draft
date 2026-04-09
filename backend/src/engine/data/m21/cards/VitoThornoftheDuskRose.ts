import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const VitoThornoftheDuskRose: Record<string, ImplementableCard> = {
    "Vito, Thorn of the Dusk Rose": {
        name: "Vito, Thorn of the Dusk Rose",
        manaCost: "{2}{B}",
        oracleText: "Whenever you gain life, target opponent loses that much life.\n{3}{B}{B}: Creatures you control gain lifelink until end of turn.",
        colors: ["black"],
        supertypes: ["Legendary"],
        types: ["Creature"],
        subtypes: ["Vampire","Cleric"],
        power: "1",
        toughness: "3",
        keywords: [],
        abilities: [
            {
                id: "vito_life_gain_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_LIFE_GAIN',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.playerId === source.controllerId,
                targetDefinition: { type: TargetType.Player, count: 1, restrictions: ['Opponent'] },
                effects: [{ type: 'LoseLife', amount: 'EVENT_AMOUNT', targetMapping: 'TARGET_1' }]
            },
            {
                id: "vito_activated_lifelink",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Mana', value: '{3}{B}{B}' }],
                effects: [{ type: 'ApplyContinuousEffect', duration: 'UNTIL_END_OF_TURN', layer: 6, abilitiesToAdd: ['Lifelink'], targetMapping: 'ALL_CREATURES_YOU_CONTROL' }]
            }
        ]
    }
};
