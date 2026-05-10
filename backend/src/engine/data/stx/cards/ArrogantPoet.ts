import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TriggerEvent, DurationType } from '@shared/engine_types';

export const ArrogantPoet: CardDefinition = {
    name: 'Arrogant Poet',
    manaCost: '{1}{B}',

    colors: ['B'],
    types: ['Creature'],
    subtypes: ['Human', 'Warlock'],
    power: "2",
    toughness: "1",
    oracleText: 'Whenever Arrogant Poet attacks, you may pay 2 life. If you do, it gains flying until end of turn.',
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Attack,
            condition: 'SelfAttacking',
            effects: [{
                type: EffectType.Choice,
                label: "Pay 2 life for flying?",
                optional: true,
                choices: [{
                    label: "Pay 2 Life",
                    costs: [{ type: CostType.PayLife, value: 2 }],
                    effects: [{
                        type: EffectType.ApplyContinuousEffect,
                        targetMapping: TargetMapping.Self,
                        duration: { type: DurationType.UntilEndOfTurn },
                        abilitiesToAdd: ['Flying']
                    }]
                }]
            }]
        }
    ],
    scryfall_id: "556a0816-83c5-41dc-8546-213b21e2cceb",
    image_url: "https://cards.scryfall.io/normal/front/5/5/556a0816-83c5-41dc-8546-213b21e2cceb.jpg?1624590711",
    rarity: "common"
};

