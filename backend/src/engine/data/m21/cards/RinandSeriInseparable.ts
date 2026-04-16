import { AbilityType, CardDefinition, EffectType, TargetType, TriggerEvent, CostType, TargetMapping } from '@shared/engine_types';

export const RinandSeriInseparable: CardDefinition = {
    name: "Rin and Seri, Inseparable",
    manaCost: "{1}{G}{W}{R}",
    oracleText: "Whenever you cast a Dog spell, create a 1/1 green Cat creature token.\nWhenever you cast a Cat spell, create a 1/1 white Dog creature token.\n{R}{G}{W}, {T}: Rin and Seri, Inseparable deals damage to any target equal to the number of Dogs you control. You gain life equal to the number of Cats you control.",
    colors: ["G", "W", "R"],
    supertypes: ["Legendary"],
    types: ["Creature"],
    subtypes: ["Dog", "Cat"],
    power: "4",
    toughness: "4",
    keywords: [],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastSpell,
            condition: (state: any, event: any, source: any) => event.playerId === source.controllerId && event.data?.card?.definition?.subtypes?.includes('Dog'),
            effects: [{ type: EffectType.CreateToken, tokenBlueprint: { name: 'Cat', power: '1', toughness: '1', colors: ['G'], types: ['Creature'], subtypes: ['Cat'] }, targetMapping: TargetMapping.Controller }]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastSpell,
            condition: (state: any, event: any, source: any) => event.playerId === source.controllerId && event.data?.card?.definition?.subtypes?.includes('Cat'),
            effects: [{ type: EffectType.CreateToken, tokenBlueprint: { name: 'Dog', power: '1', toughness: '1', colors: ['W'], types: ['Creature'], subtypes: ['Dog'] }, targetMapping: TargetMapping.Controller }]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Mana, value: '{R}{G}{W}' }, { type: CostType.Tap }],
            targetDefinition: { type: TargetType.AnyTarget, count: 1 },
            effects: [
                { type: EffectType.DealDamage, amount: 'COUNT_Dog', targetMapping: TargetMapping.Target1 },
                { type: EffectType.GainLife, amount: 'COUNT_Cat', targetMapping: TargetMapping.Controller }
            ]
        }
    ]
};




