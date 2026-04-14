import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const SilversmoteGhoul: Record<string, ImplementableCard> = {
    "Silversmote Ghoul": {
        name: "Silversmote Ghoul",
        manaCost: "{2}{B}",
        oracleText: "At the beginning of your end step, if you gained 3 or more life this turn, return Silversmote Ghoul from your graveyard to the battlefield tapped.\nSacrifice Silversmote Ghoul: Draw a card.",
        colors: ["black"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Zombie","Vampire"],
        power: "3",
        toughness: "1",
        keywords: [],
        abilities: [
            {
                id: "silversmote_ghoul_return",
                type: AbilityType.Triggered,
                    eventMatch: 'ON_END_STEP',
                activeZone: ZoneRequirement.Graveyard,
                condition: (state: any, event: any, source: any) => state.activePlayerId === source.controllerId && (state.turnState.lifeGainedThisTurn || 0) >= 3,
                effects: [{ type: 'PutOnBattlefield', targetMapping: 'SELF', tapped: true }]
            },
            {
                id: "silversmote_ghoul_sacrifice",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Mana', value: '{1}{B}' }, { type: 'Sacrifice', targetMapping: 'SELF' }],
                effects: [{ type: 'DrawCards', amount: 1, targetMapping: 'CONTROLLER' }]
            }
        ]
    }
};


