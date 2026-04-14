import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const TranquilCove: Record<string, ImplementableCard> = {
    "Tranquil Cove": {
        name: "Tranquil Cove",
        manaCost: "",
        oracleText: "Tranquil Cove enters the battlefield tapped.\nWhen Tranquil Cove enters the battlefield, you gain 1 life.\n{T}: Add {W} or {U}.",
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
                id: "tranquil_cove_etb_life",
                type: AbilityType.Triggered,
                    eventMatch: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                condition: (state: any, event: any, source: any) => {
                    return event.data?.object?.id === source.sourceId;
                },
                effects: [{ type: EffectType.GainLife, amount: 1, targetMapping: 'CONTROLLER' }]
            },
            {
                id: "tranquil_cove_mana_w",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                isManaAbility: true,
                costs: [{ type: 'Tap', targetMapping: 'SELF' }],
                effects: [{ type: EffectType.AddMana, value: 'W', amount: 1, targetMapping: 'CONTROLLER' }]
            },
            {
                id: "tranquil_cove_mana_u",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                isManaAbility: true,
                costs: [{ type: 'Tap', targetMapping: 'SELF' }],
                effects: [{ type: EffectType.AddMana, value: 'U', amount: 1, targetMapping: 'CONTROLLER' }]
            }
        ]
    }
};


