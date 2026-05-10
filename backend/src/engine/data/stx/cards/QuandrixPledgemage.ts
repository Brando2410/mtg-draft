import { AbilityType, CardDefinition, CounterType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const QuandrixPledgemage: CardDefinition = {
    name: 'Quandrix Pledgemage',
    manaCost: '{1}{G/U}{G/U}',
    colors: ['G', 'U'],
    types: ['Creature'],
    subtypes: ['Human', 'Wizard'],
    power: '2',
    toughness: '2',
    oracleText: 'Magecraft — Whenever you cast or copy an instant or sorcery spell, put a +1/+1 counter on Quandrix Pledgemage.',
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Magecraft,
            effects: [{ type: EffectType.AddCounters, counterType: CounterType.P1P1, amount: 1, targetMapping: TargetMapping.Self }]
        }
    ],
    scryfall_id: "07633b7f-4150-458b-89c3-d05dc0e3c4bd",
    image_url: "https://cards.scryfall.io/normal/front/0/7/07633b7f-4150-458b-89c3-d05dc0e3c4bd.jpg?1624739572",
    rarity: "common"
};

