import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const ObsessiveStitcher: CardDefinition = {
    name: "Obsessive Stitcher",
    manaCost: "{1}{U}{B}",
    oracleText: "{T}: Draw a card, then discard a card.\n{2}{U}{B}, {T}, Sacrifice this creature: Return target creature card from your graveyard to the battlefield.",
    colors: ["B", "U"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Human", "Wizard"],
    power: "0",
    toughness: "3",
    keywords: [],
    abilities: [
        {
            name: "Loot",
            type: AbilityType.Activated,
            costs: [{ type: CostType.Tap }],
            effects: [{ type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller }, { type: EffectType.DiscardCards, amount: 1, targetMapping: TargetMapping.Controller }]
        },
        {
            name: "Reanimate",
            type: AbilityType.Activated,
            activeZone: Zone.Battlefield,
            costs: [{ type: CostType.Mana, value: '{2}{U}{B}' }, { type: CostType.Tap }, { type: CostType.SacrificeSelf }],
            targetDefinition: { type: TargetType.CardInGraveyard, count: 1, restrictions: ['Creature'] },
            effects: [{ type: EffectType.PutOnBattlefield, targetMapping: TargetMapping.Target1 }]
        }
    ]
};


