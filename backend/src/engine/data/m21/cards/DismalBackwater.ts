import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const DismalBackwater: Record<string, ImplementableCard> = {
    "Dismal Backwater": {
        name: "Dismal Backwater",
        manaCost: "",
        oracleText: "Dismal Backwater enters the battlefield tapped.\nWhen Dismal Backwater enters the battlefield, you gain 1 life.\n{T}: Add {U} or {B}.",
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
                id: "dismal_backwater_etb_life",
                type: AbilityType.Triggered,
                    eventMatch: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                condition: (state: any, event: any, source: any) => {
                    return event.data?.object?.id === source.sourceId;
                },
                effects: [{ type: EffectType.GainLife, amount: 1, targetMapping: 'CONTROLLER' }]
            },
            {
                id: "dismal_backwater_mana_u",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                isManaAbility: true,
                costs: [{ type: 'Tap', targetMapping: 'SELF' }],
                effects: [{ type: EffectType.AddMana, value: 'U', amount: 1, targetMapping: 'CONTROLLER' }]
            },
            {
                id: "dismal_backwater_mana_b",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                isManaAbility: true,
                costs: [{ type: 'Tap', targetMapping: 'SELF' }],
                effects: [{ type: EffectType.AddMana, value: 'B', amount: 1, targetMapping: 'CONTROLLER' }]
            }
        ]
    }
};


