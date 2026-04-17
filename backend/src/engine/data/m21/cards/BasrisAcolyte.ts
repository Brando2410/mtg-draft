import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const BasrisAcolyte: CardDefinition = {
    name: "Basri's Acolyte",
    manaCost: "{2}{W}{W}",
    oracleText: "Lifelink (Damage dealt by this creature also causes you to gain that much life.)\nWhen this creature enters, put a +1/+1 counter on each of up to two other target creatures you control.",
    colors: ["W"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Cat", "Cleric"],
    power: "2",
    toughness: "3",
    keywords: ["Lifelink"],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            targetDefinition: { type: TargetType.Creature, count: 2, minCount: 0, optional: true, restrictions: [
                { type: 'Identity', value: 'Other' },
                { type: 'Control', value: 'YouControl' }
            ] },
            effects: [{ type: EffectType.AddCounters, amount: 1, counterType: 'p1p1', targetMapping: TargetMapping.Target1 }],
        }
    ]
};



