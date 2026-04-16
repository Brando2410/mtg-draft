import { AbilityType, CardDefinition, EffectType, GameEvent, GameObject, TargetType, Zone } from '@shared/engine_types';

export const FalconerAdept: CardDefinition = {
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
                activeZone: Zone.Battlefield,
                condition: (state: any, event: any, source: any) => event.playerId === source.controllerId && event.targetId === source.sourceId,
                effects: [{
                    type: 'CreateToken',
                    tokenBlueprint: { name: 'Bird', power: '1', toughness: '1', colors: ['W'], types: ['Creature'], subtypes: ['Bird'], keywords: ['Flying'] },
                    targetMapping: 'CONTROLLER',
                    isAttacking: true
                }]
            }
        ]
    };




