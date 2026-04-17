import { AbilityType, CardDefinition, EffectType, TargetMapping, Zone } from '@shared/engine_types';

export const CagedZombie: CardDefinition = {

    name: "Caged Zombie",
    manaCost: "{2}{B}",
    scryfall_id: "f8067745-35b6-4abd-9ae9-712159a26c89",
    image_url: "https://cards.scryfall.io/normal/front/f/8/f8067745-35b6-4abd-9ae9-712159a26c89.jpg?1594736024",
    oracleText: "{1}{B}, {T}: Each opponent loses 2 life. Activate only if a creature died this turn.",
    colors: ["B"],
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
            activeZone: Zone.Battlefield,
            costs: [{ type: 'Mana', value: '{1}{B}' }, { type: 'Tap' }],
            condition: (state: any) => state.turnState.creaturesDiedThisTurn.length > 0,
            effects: [{ type: EffectType.LoseLife, amount: 2, targetMapping: TargetMapping.EachOpponent }]
        }
    ]

};



