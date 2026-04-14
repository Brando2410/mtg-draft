import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const BlossomingSands: Record<string, ImplementableCard> = {
    "Blossoming Sands": {
        name: "Blossoming Sands",
        manaCost: "",
        oracleText: "Blossoming Sands enters the battlefield tapped.\nWhen Blossoming Sands enters the battlefield, you gain 1 life.\n{T}: Add {G} or {W}.",
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
                id: "blossoming_sands_etb_life",
                type: AbilityType.Triggered,
                    eventMatch: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                condition: (state: any, event: any, source: any) => {
                    return event.data?.object?.id === source.sourceId;
                },
                effects: [{ type: EffectType.GainLife, amount: 1, targetMapping: 'CONTROLLER' }]
            },
            {
                id: "blossoming_sands_mana_g",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                isManaAbility: true,
                costs: [{ type: 'Tap', targetMapping: 'SELF' }],
                effects: [{ type: EffectType.AddMana, value: 'G', amount: 1, targetMapping: 'CONTROLLER' }]
            },
            {
                id: "blossoming_sands_mana_w",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                isManaAbility: true,
                costs: [{ type: 'Tap', targetMapping: 'SELF' }],
                effects: [{ type: EffectType.AddMana, value: 'W', amount: 1, targetMapping: 'CONTROLLER' }]
            }
        ]
    }
};


