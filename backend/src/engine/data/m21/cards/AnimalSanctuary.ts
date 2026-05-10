import { AbilityType, CardDefinition, CostType, EffectType, Restriction, TargetMapping, TargetType } from '@shared/engine_types';

export const AnimalSanctuary: CardDefinition = {
    name: "Animal Sanctuary",
    manaCost: "",
    oracleText: "{T}: Add {C}.\n{2}, {T}: Put a +1/+1 counter on target Bird, Cat, Dog, Goat, Ox, or Snake.",
    colors: [],
    types: ["Land"],
    abilities: [
        {
            type: AbilityType.Activated,
            isManaAbility: true,
            costs: [{ type: CostType.Tap }],
            effects: [{ type: EffectType.AddMana, manaType: 'C' }]
        },
        {
            type: AbilityType.Activated,
            costs: [
                { type: CostType.Mana, value: '{2}' },
                { type: CostType.Tap }
            ],
            targetDefinitions: [{
                type: TargetType.Creature,
                count: 1,
                restrictions: [
                    {
                        type: Restriction.Any,
                        restrictions: [
                            Restriction.Bird, Restriction.Cat, Restriction.Dog, Restriction.Goat, Restriction.Ox, Restriction.Snake
                        ]
                    }
                ]
            }],
            effects: [{ type: EffectType.AddCounters, counterType: '+1/+1', amount: 1, targetMapping: TargetMapping.Target1 }]
        }
    ],
    scryfall_id: "f8d7a2c7-666d-4fc6-bac8-ef8eb66e355d",
    image_url: "https://cards.scryfall.io/normal/front/f/8/f8d7a2c7-666d-4fc6-bac8-ef8eb66e355d.jpg?1594737594",
    rarity: "rare"
};

