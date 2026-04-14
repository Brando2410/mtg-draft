import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const StormwingEntity: Record<string, ImplementableCard> = {
    "Stormwing Entity": {
        name: "Stormwing Entity",
        manaCost: "{3}{U}{U}",
        oracleText: "This spell costs {2}{U} to cast if you've cast an instant or sorcery spell this turn.\nFlying\nWhen this creature enters, scry 2.\nProwess",
        colors: ["blue"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Elemental","Siren"],
        power: "3",
        toughness: "3",
        keywords: ["Flying"],
        abilities: [
            {
                id: "stormwing_cost_reduction",
                type: AbilityType.Static,
                activeZone: Zone.Hand,
                effects: [
                    {
                        type: 'CostReduction',
                        targetMapping: 'SELF',
                        manaReduction: '{3}{U}',
                        restrictions: ['instantorsorcerycastthisturn']
                    }
                ]
            },
            {
                id: "stormwing_etb_scry",
                type: AbilityType.Triggered,
                    eventMatch: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                effects: [{ type: 'Scry', amount: 2, targetMapping: 'CONTROLLER' }]
            }
        ]
    }
};


