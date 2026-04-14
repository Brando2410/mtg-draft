import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const GadraktheCrownScourge: Record<string, ImplementableCard> = {
    "Gadrak, the Crown-Scourge": {
        name: "Gadrak, the Crown-Scourge",
        manaCost: "{2}{R}",
        oracleText: "Flying\nGadrak can't attack unless you control four or more artifacts.\nAt the beginning of your end step, create a Treasure token for each nontoken creature that died this turn. (It's an artifact with \"{T}, Sacrifice this token: Add one mana of any color.\")",
        colors: ["red"],
        supertypes: ["Legendary"],
        types: ["Creature"],
        subtypes: ["Dragon"],
        power: "5",
        toughness: "4",
        keywords: ["Flying"],
        abilities: [
            {
                id: "gaddrak_attack_constraint",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [{
                    type: 'CombatConstraint',
                    value: 'CANNOT_ATTACK',
                    condition: 'ARTIFACT_COUNT_GE:4',
                    targetMapping: 'SELF'
                }]
            },
            {
                id: "gaddrak_end_step_treasure",
                type: AbilityType.Triggered,
                    eventMatch: 'ON_END_STEP',
                activeZone: ZoneRequirement.Battlefield,
                condition: (state: any, event: any, source: any) => state.activePlayerId === source.controllerId,
                effects: [{
                    type: 'CreateToken',
                    tokenBlueprint: { name: 'Treasure', colors: [], types: ['Artifact'], subtypes: ['Treasure'], oracleText: '{T}, Sacrifice this artifact: Add one mana of any color.' },
                    amount: 'NONTOKEN_CREATURES_DIED_THIS_TURN_COUNT',
                    targetMapping: 'CONTROLLER'
                }]
            }
        ]
    }
};


