import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

export const MazemindTome: CardDefinition = {
    name: "Mazemind Tome",
    manaCost: "{2}",
    scryfall_id: "9fd761f3-6b43-4150-8595-dc3abd85b06c",
    image_url: "https://cards.scryfall.io/normal/front/9/f/9fd761f3-6b43-4150-8595-dc3abd85b06c.jpg?1594737505",
    oracleText: "{T}, Put a page counter on this artifact: Scry 1. (Look at the top card of your library. You may put that card on the bottom.)\n{2}, {T}, Put a page counter on this artifact: Draw a card.\nWhen there are four or more page counters on this artifact, exile it. If you do, you gain 4 life.",
    colors: [],
    supertypes: [],
    types: ["Artifact"],
    subtypes: [],
    keywords: [],
    abilities: [
        {
            id: "Scry 1",
            type: AbilityType.Activated,
            activeZone: Zone.Battlefield,
            costs: [{ type: CostType.Tap }],
            effects: [
                { type: EffectType.AddCounters, amount: 1, value: 'page', targetMapping: TargetMapping.Self },
                { type: EffectType.Scry, amount: 1, targetMapping: TargetMapping.Controller }
            ]
        },
        {
            id: "Draw a card",
            type: AbilityType.Activated,
            activeZone: Zone.Battlefield,
            costs: [{ type: CostType.Mana, value: '{2}' }, { type: CostType.Tap }],
            effects: [
                { type: EffectType.AddCounters, amount: 1, value: 'page', targetMapping: TargetMapping.Self },
                { type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CountersAdded,
            condition: (state: any, event: any) => event.counterType === 'page' && (event.data?.object?.counters['page'] || 0) >= 4,
            effects: [
                { type: EffectType.Exile, targetMapping: TargetMapping.Self },
                { type: EffectType.GainLife, amount: 4, targetMapping: TargetMapping.Controller }
            ]
        }
    ]
};




