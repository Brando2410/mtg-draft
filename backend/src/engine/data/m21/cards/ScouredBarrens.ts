import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const ScouredBarrens: Record<string, ImplementableCard> = {
    "Scoured Barrens": {
        name: "Scoured Barrens",
        manaCost: "",
        oracleText: "Scoured Barrens enters the battlefield tapped.\nWhen Scoured Barrens enters the battlefield, you gain 1 life.\n{T}: Add {W} or {B}.",
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
                id: "scoured_barrens_etb_life",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => {
                    return event.data?.object?.id === source.sourceId;
                },
                effects: [{ type: EffectType.GainLife, amount: 1, targetMapping: 'CONTROLLER' }]
            },
            {
                id: "scoured_barrens_mana_w",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                isManaAbility: true,
                costs: [{ type: 'Tap', targetMapping: 'SELF' }],
                effects: [{ type: EffectType.AddMana, value: 'W', amount: 1, targetMapping: 'CONTROLLER' }]
            },
            {
                id: "scoured_barrens_mana_b",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                isManaAbility: true,
                costs: [{ type: 'Tap', targetMapping: 'SELF' }],
                effects: [{ type: EffectType.AddMana, value: 'B', amount: 1, targetMapping: 'CONTROLLER' }]
            }
        ]
    }
};
