import { AbilityType, ZoneRequirement, ImplementableCard } from '@shared/engine_types';

export const BarrinTolarianArchmage: Record<string, ImplementableCard> = {
    "Barrin, Tolarian Archmage": {
        name: "Barrin, Tolarian Archmage",
        manaCost: "{1}{U}{U}",
        oracleText: "When Barrin enters, return up to one other target creature or planeswalker to its owner's hand.\nAt the beginning of your end step, if a permanent was put into your hand from the battlefield this turn, draw a card.",
        colors: ["blue"],
        supertypes: ["Legendary"],
        types: ["Creature"],
        subtypes: ["Human","Wizard"],
        power: "2",
        toughness: "2",
        keywords: [],
        abilities: [
            {
                id: "barrin_etb_bounce",
                type: AbilityType.Triggered,
                    eventMatch: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                condition: (state: any, event: any, source: any) => event.data?.object?.id === source.sourceId,
                targetDefinition: { type: 'Permanent', count: 1, optional: true, restrictions: ['Creature', 'Planeswalker', 'Other'] },
                effects: [{ type: 'ReturnToHand', targetMapping: 'TARGET_1' }]
            },
            {
                id: "barrin_end_step_draw",
                type: AbilityType.Triggered,
                    eventMatch: 'ON_END_STEP',
                activeZone: ZoneRequirement.Battlefield,
                condition: (state: any, event: any, source: any) => state.activePlayerId === source.controllerId && state.turnState.playersWithPermanentReturnedThisTurn[source.controllerId] === true,
                effects: [{ type: 'DrawCards', amount: 1, targetMapping: 'CONTROLLER' }]
            }
        ]
    }
};


