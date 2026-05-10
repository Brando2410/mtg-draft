import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping } from '@shared/engine_types';

export const IndulgentAristocrat: CardDefinition = {
    name: "Indulgent Aristocrat",
    manaCost: "{B}",
    oracleText: "Lifelink\n{2}, Sacrifice a creature: Put a +1/+1 counter on each Vampire you control.",
    colors: ["B"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Vampire"],
    power: "1",
    toughness: "1",
    keywords: ["Lifelink"],
    set: "SOI",
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [
                { type: CostType.Mana, value: '{2}' },
                { type: CostType.Sacrifice, restrictions: [
                { type: 'Type', value: 'Creature' }
            ] }
            ],
            effects: [{
                type: EffectType.AddCounters,
                amount: 1,
                counterType: '+1/+1',
                targetMapping: TargetMapping.AllMatchingPermanentsYouControl,
                restrictions: [
                { type: 'Type', value: 'Vampire' }
            ]
            }]
        }
    ],
    scryfall_id: "07015524-874f-4856-a5c1-3148bd126886",
    image_url: "https://cards.scryfall.io/normal/front/0/7/07015524-874f-4856-a5c1-3148bd126886.jpg?1736467987",
    rarity: "uncommon"
};

