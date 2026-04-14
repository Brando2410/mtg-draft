import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const RuggedHighlands: Record<string, ImplementableCard> = {
    "Rugged Highlands": {
        name: "Rugged Highlands",
        manaCost: "",
        oracleText: "Rugged Highlands enters the battlefield tapped.\nWhen Rugged Highlands enters the battlefield, you gain 1 life.\n{T}: Add {R} or {G}.",
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
                id: "rugged_highlands_etb_life",
                type: AbilityType.Triggered,
                    eventMatch: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                condition: (state: any, event: any, source: any) => {
                    return event.data?.object?.id === source.sourceId;
                },
                effects: [{ type: EffectType.GainLife, amount: 1, targetMapping: 'CONTROLLER' }]
            },
            {
                id: "rugged_highlands_mana_r",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                isManaAbility: true,
                costs: [{ type: 'Tap', targetMapping: 'SELF' }],
                effects: [{ type: EffectType.AddMana, value: 'R', amount: 1, targetMapping: 'CONTROLLER' }]
            },
            {
                id: "rugged_highlands_mana_g",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                isManaAbility: true,
                costs: [{ type: 'Tap', targetMapping: 'SELF' }],
                effects: [{ type: EffectType.AddMana, value: 'G', amount: 1, targetMapping: 'CONTROLLER' }]
            }
        ]
    }
};


