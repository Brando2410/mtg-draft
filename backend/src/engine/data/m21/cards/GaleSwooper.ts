import { AbilityType, CardDefinition, EffectType, GameEvent, GameObject, TargetType, Zone } from '@shared/engine_types';

export const GaleSwooper: CardDefinition = {
        name: "Gale Swooper",
        manaCost: "{3}{W}",
    scryfall_id: "d2e3b99c-e48e-4f4d-ba7a-e9218137b432",
    image_url: "https://cards.scryfall.io/normal/front/d/2/d2e3b99c-e48e-4f4d-ba7a-e9218137b432.jpg?1594734966",
        oracleText: "Flying\nWhen this creature enters, target creature gains flying until end of turn.",
        colors: ["white"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Griffin"],
        power: "3",
        toughness: "2",
        keywords: ["Flying"],
        abilities: [
            {
                id: "gale_swooper_etb",
                type: AbilityType.Triggered,
                    eventMatch: 'ON_ETB',
                activeZone: Zone.Battlefield,
                condition: (state: any, event: any, source: any) => event.data?.object?.id === source.sourceId,
                targetDefinition: { type: 'Permanent', count: 1, restrictions: [
                { type: 'Type', value: 'Creature' }
            ] },
                effects: [{ type: 'ApplyContinuousEffect', duration: 'UNTIL_END_OF_TURN', abilitiesToAdd: ['Flying'], layer: 6, targetMapping: 'TARGET_1' }]
            }
        ]
    };




