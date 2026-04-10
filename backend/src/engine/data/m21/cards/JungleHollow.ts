import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const JungleHollow: Record<string, ImplementableCard> = {
    "Jungle Hollow": {
        name: "Jungle Hollow",
        manaCost: "",
        oracleText: "Jungle Hollow enters the battlefield tapped.\nWhen Jungle Hollow enters the battlefield, you gain 1 life.\n{T}: Add {B} or {G}.",
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
                id: "jungle_hollow_etb_life",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => {
                    return event.data?.object?.id === source.sourceId;
                },
                effects: [{ type: EffectType.GainLife, amount: 1, targetMapping: 'CONTROLLER' }]
            },
            {
                id: "jungle_hollow_mana_b",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                isManaAbility: true,
                costs: [{ type: 'Tap', targetMapping: 'SELF' }],
                effects: [{ type: EffectType.AddMana, value: 'B', amount: 1, targetMapping: 'CONTROLLER' }]
            },
            {
                id: "jungle_hollow_mana_g",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                isManaAbility: true,
                costs: [{ type: 'Tap', targetMapping: 'SELF' }],
                effects: [{ type: EffectType.AddMana, value: 'G', amount: 1, targetMapping: 'CONTROLLER' }]
            }
        ]
    }
};
