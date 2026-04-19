import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const DuelingCoach: CardDefinition = {
    name: 'Dueling Coach',
    manaCost: '{3}{W}',
    scryfall_id: "45b3dbb0-0d68-4351-bfc9-a09c50454bf7",
    image_url: "https://cards.scryfall.io/normal/front/4/5/45b3dbb0-0d68-4351-bfc9-a09c50454bf7.jpg?1624589385",
    colors: ['W'],
    types: ['Creature'],
    subtypes: ['Human', 'Wizard'],
    power: "2",
    toughness: "2",
    oracleText: 'When Dueling Coach enters the battlefield, put a+1/+1 counter on target creature.\n{4}, {T}: Put a +1/+1 counter on each creature you control with a +1/+1 counter on it.',
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            targetDefinition: { count: 1, type: TargetType.Creature },
            effects: [{ type: EffectType.AddCounters, counterType: 'P1P1', amount: 1, targetMapping: TargetMapping.Target1 }]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Mana, value: '{4}' }, { type: CostType.Tap }],
            effects: [{
                type: EffectType.AddCounters,
                counterType: 'P1P1',
                amount: 1,
                targetMapping: TargetMapping.AllMatchingPermanentsYouControl,
                restrictions: ['Creature', 'hascounter_P1P1']
            }]
        }
    ]
};


