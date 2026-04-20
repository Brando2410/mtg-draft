import { AbilityType, CardDefinition, CostType, EffectType, Restriction, TargetMapping, TargetType } from '@shared/engine_types';

export const ObsessiveStitcher: CardDefinition = {
    name: "Obsessive Stitcher",
    manaCost: "{1}{U}{B}",
    scryfall_id: "e449f985-d149-49eb-87d9-7a325215f82d",
    image_url: "https://cards.scryfall.io/normal/front/e/4/e449f985-d149-49eb-87d9-7a325215f82d.jpg?1594737421",
    oracleText: "{T}: Draw a card, then discard a card.\n{2}{U}{B}, {T}, Sacrifice this creature: Return target creature card from your graveyard to the battlefield.",
    colors: ["U", "B"],
    types: ["Creature"],
    subtypes: ["Human", "Wizard"],
    power: "0",
    toughness: "3",
    abilities: [
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Tap }],
            effects: [
                { type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller },
                { type: EffectType.DiscardCards, amount: 1, targetMapping: TargetMapping.Controller }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [
                { type: CostType.Mana, value: '{2}{U}{B}' },
                { type: CostType.Tap },
                { type: CostType.SacrificeSelf }
            ],
            targetDefinition: {
                type: TargetType.CardInGraveyard,
                count: 1,
                restrictions: [Restriction.Creature]
            },
            effects: [{
                type: EffectType.PutOnBattlefield,
                targetMapping: TargetMapping.Target1
            }]
        }
    ]
};
