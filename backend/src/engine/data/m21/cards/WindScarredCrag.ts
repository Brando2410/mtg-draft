import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const WindScarredCrag: Record<string, ImplementableCard> = {
    "Wind-Scarred Crag": {
        name: "Wind-Scarred Crag",
        manaCost: "",
        oracleText: "Wind-Scarred Crag enters the battlefield tapped.\nWhen Wind-Scarred Crag enters the battlefield, you gain 1 life.\n{T}: Add {R} or {W}.",
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
                id: "wind_scarred_crag_etb_life",
                type: AbilityType.Triggered,
                    eventMatch: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                condition: (state: any, event: any, source: any) => {
                    return event.data?.object?.id === source.sourceId;
                },
                effects: [{ type: EffectType.GainLife, amount: 1, targetMapping: 'CONTROLLER' }]
            },
            {
                id: "wind_scarred_crag_mana_r",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                isManaAbility: true,
                costs: [{ type: 'Tap', targetMapping: 'SELF' }],
                effects: [{ type: EffectType.AddMana, value: 'R', amount: 1, targetMapping: 'CONTROLLER' }]
            },
            {
                id: "wind_scarred_crag_mana_w",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                isManaAbility: true,
                costs: [{ type: 'Tap', targetMapping: 'SELF' }],
                effects: [{ type: EffectType.AddMana, value: 'W', amount: 1, targetMapping: 'CONTROLLER' }]
            }
        ]
    }
};


