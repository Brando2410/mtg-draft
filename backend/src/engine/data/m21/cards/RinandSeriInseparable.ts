import { AbilityType, CardDefinition, EffectType, GameEvent, GameObject, TargetType, Zone } from '@shared/engine_types';

export const RinandSeriInseparable: CardDefinition = {
        name: "Rin and Seri, Inseparable",
        manaCost: "{1}{G}{W}{R}",
        oracleText: "Whenever you cast a Dog spell, create a 1/1 green Cat creature token.\nWhenever you cast a Cat spell, create a 1/1 white Dog creature token.\n{R}{G}{W}, {T}: Rin and Seri, Inseparable deals damage to any target equal to the number of Dogs you control. You gain life equal to the number of Cats you control.",
        colors: ["red","green","white"],
        supertypes: ["Legendary"],
        types: ["Creature"],
        subtypes: ["Dog","Cat"],
        power: "4",
        toughness: "4",
        keywords: [],
        abilities: [
            {
                id: "rin_seri_cast_dog",
                type: AbilityType.Triggered,
                    eventMatch: 'ON_CAST_SPELL',
                activeZone: Zone.Battlefield,
                condition: (state: any, event: any, source: any) => event.playerId === source.controllerId && event.data?.card?.definition?.subtypes?.includes('Dog'),
                effects: [{ type: 'CreateToken', tokenBlueprint: { name: 'Cat', power: '1', toughness: '1', colors: ['G'], types: ['Creature'], subtypes: ['Cat'] }, targetMapping: 'CONTROLLER' }]
            },
            {
                id: "rin_seri_cast_cat",
                type: AbilityType.Triggered,
                    eventMatch: 'ON_CAST_SPELL',
                activeZone: Zone.Battlefield,
                condition: (state: any, event: any, source: any) => event.playerId === source.controllerId && event.data?.card?.definition?.subtypes?.includes('Cat'),
                effects: [{ type: 'CreateToken', tokenBlueprint: { name: 'Dog', power: '1', toughness: '1', colors: ['W'], types: ['Creature'], subtypes: ['Dog'] }, targetMapping: 'CONTROLLER' }]
            },
            {
                id: "rin_seri_activated",
                type: AbilityType.Activated,
                activeZone: Zone.Battlefield,
                costs: [{ type: 'Mana', value: '{R}{G}{W}' }, { type: 'Tap' }],
                targetDefinition: { type: 'AnyTarget', count: 1 },
                effects: [
                    { type: 'DealDamage', amount: 'COUNT_Dog', targetMapping: 'TARGET_1' },
                    { type: 'GainLife', amount: 'COUNT_Cat', targetMapping: 'CONTROLLER' }
                ]
            }
        ]
    };




