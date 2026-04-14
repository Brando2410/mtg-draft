import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const FalconerAdept: Record<string, ImplementableCard> = {
    "Falconer Adept": {
        name: "Falconer Adept",
        manaCost: "{3}{W}",
        oracleText: "Whenever this creature attacks, create a 1/1 white Bird creature token with flying that's tapped and attacking.",
        colors: ["white"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Human","Soldier"],
        power: "2",
        toughness: "3",
        keywords: [],
        abilities: [
            {
                id: "falconer_adept_trigger",
                type: AbilityType.Triggered,
                    eventMatch: 'ON_ATTACK',
                activeZone: ZoneRequirement.Battlefield,
                condition: (state: any, event: any, source: any) => event.playerId === source.controllerId && event.targetId === source.sourceId,
                effects: [{
                    type: 'CreateToken',
                    tokenBlueprint: { name: 'Bird', power: '1', toughness: '1', colors: ['W'], types: ['Creature'], subtypes: ['Bird'], keywords: ['Flying'] },
                    targetMapping: 'CONTROLLER',
                    isAttacking: true
                }]
            }
        ]
    }
};


