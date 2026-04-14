import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const SanctumofCalmWaters: Record<string, ImplementableCard> = {
    "Sanctum of Calm Waters": {
        name: "Sanctum of Calm Waters",
        manaCost: "{3}{U}",
        oracleText: "At the beginning of your precombat main phase, you may draw X cards, where X is the number of Shrines you control. If you do, discard a card.",
        colors: ["blue"],
        supertypes: ["Legendary"],
        types: ["Enchantment"],
        subtypes: ["Shrine"],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "sanctum_calm_waters_trigger",
                type: AbilityType.Triggered,
                    eventMatch: 'ON_PRE_COMBAT_MAIN_PHASE_START',
                activeZone: ZoneRequirement.Battlefield,
                condition: (state: any, event: any, source: any) => event.playerId === source.controllerId,
                effects: [
                    {
                        type: 'Choice',
                        label: 'Draw cards for each Sanctum you control? (and discard a card)',
                        choices: [
                            {
                                label: 'Yes',
                                effects: [
                                    { type: 'DrawCards', amount: 'COUNT_Shrine', targetMapping: 'CONTROLLER' },
                                    { type: 'DiscardCards', amount: 1, targetMapping: 'CONTROLLER' }
                                ]
                            },
                            { label: 'No', effects: [] }
                        ],
                        targetMapping: 'CONTROLLER'
                    }
                ]
            }
        ]
    }
};


