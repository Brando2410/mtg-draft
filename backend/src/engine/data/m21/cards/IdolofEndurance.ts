import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const IdolofEndurance: Record<string, ImplementableCard> = {
    "Idol of Endurance": {
        name: "Idol of Endurance",
        manaCost: "{2}{W}",
        oracleText: "When this artifact enters, exile all creature cards with mana value 3 or less from your graveyard until this artifact leaves the battlefield.\n{1}{W}, {T}: Until end of turn, you may cast a creature spell from among cards exiled with this artifact without paying its mana cost.",
        colors: ["white"],
        supertypes: [],
        types: ["Artifact"],
        subtypes: [],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "idol_endurance_etb",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.data?.object?.id === source.sourceId,
                effects: [{
                    type: EffectType.MoveToZone,
                    selectionType: 'All',
                    sourceZones: [Zone.Graveyard],
                    destination: Zone.Exile,
                    restrictions: ['Creature', 'CMC <= 3', 'YouControl'],
                    targetMapping: 'CONTROLLER'
                }]
            },
            {
                id: "idol_endurance_active",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Mana', value: '{1}{W}' }, { type: 'Tap', value: null }],
                effects: [{
                    type: EffectType.ApplyContinuousEffect,
                    duration: 'UNTIL_END_OF_TURN',
                    isFreeCast: true,
                    targetMapping: 'CHOICE_FROM_EXILED'
                }]
            }
        ]
    }
};
