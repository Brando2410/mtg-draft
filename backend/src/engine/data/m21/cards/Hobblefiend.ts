import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const Hobblefiend: CardDefinition = {
    name: "Hobblefiend",
    manaCost: "{1}{R}",
    scryfall_id: "4bfffc18-b36a-4dd5-909e-60ea9f8eb60b",
    image_url: "https://cards.scryfall.io/normal/front/4/b/4bfffc18-b36a-4dd5-909e-60ea9f8eb60b.jpg?1594736699",
    oracleText: "Trample\n{1}, Sacrifice another creature: Put a +1/+1 counter on Hobblefiend. Activate only as a sorcery.",
    colors: ["R"],
    types: ["Creature"],
    subtypes: ["Elemental", "Devil"],
    power: "2",
    toughness: "1",
    keywords: ["Trample"],
    abilities: [
        {
            type: AbilityType.Activated,
            activeZone: Zone.Battlefield,
            activatedOnlyAsSorcery: true,
            costs: [
                { type: CostType.Mana, value: '{1}' },
                {
                    type: CostType.Sacrifice,
                    restrictions: [
                { type: 'Identity', value: 'Other' }
            ]
                }
            ],
            effects: [{
                type: EffectType.AddCounters,
                counterType: '+1/+1',
                amount: 1,
                targetMapping: TargetMapping.Self
            }]
        }
    ]
};


