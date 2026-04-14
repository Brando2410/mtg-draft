import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const CagedZombie: Record<string, ImplementableCard> = {
    "Caged Zombie": {
        name: "Caged Zombie",
        manaCost: "{2}{B}",
        oracleText: "{1}{B}, {T}: Each opponent loses 2 life. Activate only if a creature died this turn.",
        colors: ["black"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Zombie"],
        power: "2",
        toughness: "3",
        keywords: [],
        abilities: [
            {
                id: "caged_zombie_lose_life",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Mana', value: '{1}{B}' }, { type: 'Tap', value: null }],
                condition: (state: any) => state.turnState.creaturesDiedThisTurn.length > 0,
                effects: [{ type: 'LoseLife', amount: 2, targetMapping: 'OPPONENT' }]
            }
        ]
    }
};

