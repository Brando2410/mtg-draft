import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const MazemindTome: CardDefinition = {
    name: "Mazemind Tome",
    manaCost: "{2}",

    oracleText: "{T}, Put a page counter on this artifact: Scry 1. (Look at the top card of your library. You may put that card on the bottom.)\n{2}, {T}, Put a page counter on this artifact: Draw a card.\nWhen there are four or more page counters on this artifact, exile it. If you do, you gain 4 life.",
    colors: [],
    types: ["Artifact"],
    abilities: [
        {
            id: "Scry 1",
            type: AbilityType.Activated,
            costs: [
                { type: CostType.Tap },
                { type: CostType.AddCounter, counterType: 'page', amount: 1 }
            ],
            effects: [{ type: EffectType.Scry, amount: 1, targetMapping: TargetMapping.Controller }]
        },
        {
            id: "Draw a card",
            type: AbilityType.Activated,
            costs: [
                { type: CostType.Mana, value: '{2}' },
                { type: CostType.Tap },
                { type: CostType.AddCounter, counterType: 'page', amount: 1 }
            ],
            effects: [{ type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller }]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CountersAdded,
            condition: 'SOURCE_HAS_4_OR_MORE_PAGE_COUNTERS',
            effects: [
                { type: EffectType.Exile, targetMapping: TargetMapping.Self },
                { type: EffectType.GainLife, amount: 4, targetMapping: TargetMapping.Controller }
            ]
        }
    ],
    scryfall_id: "f45072cd-e3f2-4090-b984-50ec8d360bf2",
    image_url: "https://cards.scryfall.io/normal/front/f/4/f45072cd-e3f2-4090-b984-50ec8d360bf2.jpg?1730491155",
    rarity: "rare"
};

