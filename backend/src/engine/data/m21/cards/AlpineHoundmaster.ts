import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const AlpineHoundmaster: Record<string, ImplementableCard> = {
    "Alpine Houndmaster": {
        name: "Alpine Houndmaster",
        manaCost: "{R}{W}",
        oracleText: "When this creature enters, you may search your library for a card named Alpine Watchdog and/or a card named Igneous Cur, reveal them, put them into your hand, then shuffle.\nWhenever this creature attacks, it gets +X/+0 until end of turn, where X is the number of other attacking creatures.",
        colors: ["red","white"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Human","Warrior"],
        power: "2",
        toughness: "2",
        keywords: [],
        abilities: [
            {
                id: "alpine_houndmaster_etb",
                type: AbilityType.Triggered,
                    eventMatch: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                effects: [
                    {
                        type: EffectType.SearchLibrary,
                        amount: 2,
                        destination: Zone.Hand,
                        reveal: true,
                        shuffle: true,
                        optional: true,
                        restrictions: [
                            { name: 'Alpine Watchdog' },
                            { name: 'Igneous Cur' }
                        ],
                        targetMapping: 'CONTROLLER'
                    }
                ]
            },
            {
                id: "alpine_houndmaster_attack",
                type: AbilityType.Triggered,
                    eventMatch: 'ON_ATTACK',
                activeZone: ZoneRequirement.Battlefield,
                condition: (state: any, event: any, source: any) => event.sourceId === source.sourceId,
                effects: [{
                    type: EffectType.ApplyContinuousEffect,
                    powerModifier: 'COUNT_OTHER_ATTACKING',
                    toughnessModifier: 0,
                    duration: 'UNTIL_END_OF_TURN',
                    layer: 7,
                    targetMapping: 'SELF'
                }]
            }
        ]
    }
};


