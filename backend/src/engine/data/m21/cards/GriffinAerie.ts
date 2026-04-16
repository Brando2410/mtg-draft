import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const GriffinAerie: CardDefinition = {
    name: "Griffin Aerie",
    manaCost: "{1}{W}",
    oracleText: "At the beginning of your end step, if you gained 3 or more life this turn, create a 2/2 white Griffin creature token with flying.",
    colors: ["W"],
    supertypes: [],
    types: ["Enchantment"],
    subtypes: [],
    keywords: [],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EndStep,
            condition: (state: any, event: any, source: any) => state.activePlayerId === source.controllerId && (state.turnState.lifeGainedThisTurn || 0) >= 3,
            effects: [{
                type: EffectType.CreateToken,
                tokenBlueprint: { name: 'Griffin', power: '2', toughness: '2', colors: ['W'], types: ['Creature'], subtypes: ['Griffin'], keywords: ['Flying'] },
                targetMapping: TargetMapping.Controller
            }]
        }
    ]
};




