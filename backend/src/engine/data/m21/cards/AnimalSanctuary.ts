import { AbilityType, ZoneRequirement, EffectType, TargetType, CardDefinition, TargetMapping } from '@shared/engine_types';

export const AnimalSanctuary: CardDefinition = {

    name: "Animal Sanctuary",
    manaCost: "",
    oracleText: "{T}: Add {C}.\n{2}, {T}: Put a +1/+1 counter on target Bird, Cat, Dog, Goat, Ox, or Snake.",
    colors: [],
    supertypes: [],
    types: ["Land"],
    subtypes: [],
    keywords: [],
    abilities: [
        {
            id: "animal_sanctuary_mana",
            type: AbilityType.Activated,
            activeZone: ZoneRequirement.Battlefield,
            costs: [{ type: 'Tap', value: null }],
            effects: [{ type: EffectType.AddMana, amount: '{C}', targetMapping: TargetMapping.Controller }]
        },
        {
            id: "animal_sanctuary_counter",
            type: AbilityType.Activated,
            activeZone: ZoneRequirement.Battlefield,
            costs: [{ type: 'Mana', value: '{2}' }, { type: 'Tap' }],
            targetDefinition: {
                type: TargetType.Creature, count: 1,
                restrictions: [{
                    subtypes: ['Bird', 'Cat', 'Dog', 'Goat', 'Ox', 'Snake']
                }]
            },
            effects: [{ type: EffectType.AddCounters, counterType: 'p1p1', amount: 1, targetMapping: TargetMapping.Target1 }]
        }
    ]

};
