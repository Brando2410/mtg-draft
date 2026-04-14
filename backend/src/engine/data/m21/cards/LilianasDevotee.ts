import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const LilianasDevotee: Record<string, ImplementableCard> = {
    "Liliana's Devotee": {
        name: "Liliana's Devotee",
        manaCost: "{2}{B}",
        oracleText: "Zombies you control get +1/+0.\nAt the beginning of your end step, if a creature died this turn, you may pay {1}{B}. If you do, create a 2/2 black Zombie creature token.",
        colors: ["black"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Human","Warlock"],
        power: "2",
        toughness: "3",
        keywords: [],
        abilities: [
            {
                id: "liliana_devotee_lord",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [{ type: 'ApplyContinuousEffect', powerModifier: 1, toughnessModifier: 0, targetMapping: 'MATCHING_PERMANENTS_YOU_CONTROL', restrictions: ['Zombie'], layer: 7 }]
            },
            {
                id: "liliana_devotee_trigger",
                type: AbilityType.Triggered,
                    eventMatch: 'ON_END_STEP',
                activeZone: ZoneRequirement.Battlefield,
                condition: (state: any, event: any, source: any) => state.activePlayerId === source.controllerId && state.turnState.creaturesDiedThisTurn.length > 0,
                effects: [
                    {
                        type: 'Choice',
                        choices: [
                            {
                                label: 'Pay {1}{B} to create a Zombie',
                                costs: [{ type: 'Mana', value: '{1}{B}' }],
                                effects: [{ type: 'CreateToken', tokenBlueprint: { name: 'Zombie', power: '2', toughness: '2', colors: ['B'], types: ['Creature'], subtypes: ['Zombie'] }, targetMapping: 'CONTROLLER' }]
                            },
                            { label: 'Do not pay', effects: [] }
                        ],
                        targetMapping: 'CONTROLLER'
                    }
                ]
            }
        ]
    }
};


