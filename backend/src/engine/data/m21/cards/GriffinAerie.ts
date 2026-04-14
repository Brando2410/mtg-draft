import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const GriffinAerie: Record<string, ImplementableCard> = {
    "Griffin Aerie": {
        name: "Griffin Aerie",
        manaCost: "{1}{W}",
        oracleText: "At the beginning of your end step, if you gained 3 or more life this turn, create a 2/2 white Griffin creature token with flying.",
        colors: ["white"],
        supertypes: [],
        types: ["Enchantment"],
        subtypes: [],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "griffin_aerie_trigger",
                type: AbilityType.Triggered,
                    eventMatch: 'ON_END_STEP',
                activeZone: ZoneRequirement.Battlefield,
                condition: (state: any, event: any, source: any) => state.activePlayerId === source.controllerId && (state.turnState.lifeGainedThisTurn || 0) >= 3,
                effects: [{
                    type: 'CreateToken',
                    tokenBlueprint: { name: 'Griffin', power: '2', toughness: '2', colors: ['W'], types: ['Creature'], subtypes: ['Griffin'], keywords: ['Flying'] },
                    targetMapping: 'CONTROLLER'
                }]
            }
        ]
    }
};


