import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const DragonsguardElite: CardDefinition = {
    name: 'Dragonsguard Elite',
    manaCost: '{1}{G}',
    scryfall_id: "658ec634-3eb2-4967-b938-d20d31ab77e3",
    image_url: "https://cards.scryfall.io/normal/front/6/5/658ec634-3eb2-4967-b938-d20d31ab77e3.jpg?1624592623",
    colors: ['G'],
    types: ['Creature'],
    subtypes: ['Human', 'Druid'],
    power: '2',
    toughness: '2',
    oracleText: "Magecraft — Whenever you cast or copy an instant or sorcery spell, put a +1/+1 counter on Dragonsguard Elite.\n{4}{G}{G}: Double the number of +1/+1 counters on Dragonsguard Elite.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Magecraft,
            effects: [
                {
                    type: EffectType.AddCounters,
                    targetMapping: TargetMapping.Self,
                    counterType: 'P1P1',
                    amount: 1
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: 'Mana', value: '{4}{G}{G}' }],
            effects: [
                {
                    type: EffectType.AddCounters,
                    targetMapping: TargetMapping.Self,
                    counterType: 'P1P1',
                    amount: DynamicAmount.SourceCountersP1P1
                }
            ]
        }
    ]
};


