import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const BloodfellCaves: Record<string, ImplementableCard> = {
    "Bloodfell Caves": {
        name: "Bloodfell Caves",
        manaCost: "",
        oracleText: "Bloodfell Caves enters the battlefield tapped.\nWhen Bloodfell Caves enters the battlefield, you gain 1 life.\n{T}: Add {B} or {R}.",
        colors: [],
        supertypes: [],
        types: ["Land"],
        subtypes: [],
        power: undefined,
        toughness: undefined,
        keywords: [],
        entersTapped: true,
        abilities: [
            
            {
                id: "bloodfell_caves_etb_life",
                type: AbilityType.Triggered,
                    eventMatch: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                condition: (state: any, event: any, source: any) => {
                    return event.data?.object?.id === source.sourceId;
                },
                effects: [{ type: EffectType.GainLife, amount: 1, targetMapping: 'CONTROLLER' }]
            },
            {
                id: "bloodfell_caves_mana_b",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                isManaAbility: true,
                costs: [{ type: 'Tap', targetMapping: 'SELF' }],
                effects: [{ type: EffectType.AddMana, value: 'B', amount: 1, targetMapping: 'CONTROLLER' }]
            },
            {
                id: "bloodfell_caves_mana_r",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                isManaAbility: true,
                costs: [{ type: 'Tap', targetMapping: 'SELF' }],
                effects: [{ type: EffectType.AddMana, value: 'R', amount: 1, targetMapping: 'CONTROLLER' }]
            }
        ]
    }
};


