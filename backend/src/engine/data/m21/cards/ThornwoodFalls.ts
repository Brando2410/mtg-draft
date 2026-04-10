import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const ThornwoodFalls: Record<string, ImplementableCard> = {
    "Thornwood Falls": {
        name: "Thornwood Falls",
        manaCost: "",
        oracleText: "Thornwood Falls enters the battlefield tapped.\nWhen Thornwood Falls enters the battlefield, you gain 1 life.\n{T}: Add {G} or {U}.",
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
                id: "thornwood_falls_etb_life",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => {
                    return event.data?.object?.id === source.sourceId;
                },
                effects: [{ type: EffectType.GainLife, amount: 1, targetMapping: 'CONTROLLER' }]
            },
            {
                id: "thornwood_falls_mana_g",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                isManaAbility: true,
                costs: [{ type: 'Tap', targetMapping: 'SELF' }],
                effects: [{ type: EffectType.AddMana, value: 'G', amount: 1, targetMapping: 'CONTROLLER' }]
            },
            {
                id: "thornwood_falls_mana_u",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                isManaAbility: true,
                costs: [{ type: 'Tap', targetMapping: 'SELF' }],
                effects: [{ type: EffectType.AddMana, value: 'U', amount: 1, targetMapping: 'CONTROLLER' }]
            }
        ]
    }
};
