import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const SwiftwaterCliffs: Record<string, ImplementableCard> = {
    "Swiftwater Cliffs": {
        name: "Swiftwater Cliffs",
        manaCost: "",
        oracleText: "Swiftwater Cliffs enters the battlefield tapped.\nWhen Swiftwater Cliffs enters the battlefield, you gain 1 life.\n{T}: Add {U} or {R}.",
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
                id: "swiftwater_cliffs_etb_life",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => {
                    return event.data?.object?.id === source.sourceId;
                },
                effects: [{ type: EffectType.GainLife, amount: 1, targetMapping: 'CONTROLLER' }]
            },
            {
                id: "swiftwater_cliffs_mana_u",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                isManaAbility: true,
                costs: [{ type: 'Tap', targetMapping: 'SELF' }],
                effects: [{ type: EffectType.AddMana, value: 'U', amount: 1, targetMapping: 'CONTROLLER' }]
            },
            {
                id: "swiftwater_cliffs_mana_r",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                isManaAbility: true,
                costs: [{ type: 'Tap', targetMapping: 'SELF' }],
                effects: [{ type: EffectType.AddMana, value: 'R', amount: 1, targetMapping: 'CONTROLLER' }]
            }
        ]
    }
};
