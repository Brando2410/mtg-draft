import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const SpringmaneCervin: CardDefinition = {
    name: 'Springmane Cervin',
    manaCost: '{2}{G}',
    colors: ['G'],
    types: ['Creature'],
    subtypes: ['Elk'],
    power: "3",
    toughness: "2",
    oracleText: 'When Springmane Cervin enters the battlefield, you gain 2 life.',
    abilities: [
        {
            type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
            effects: [{ type: EffectType.GainLife, amount: 2, targetMapping: TargetMapping.Controller }]
        }
    ],
    scryfall_id: "f5b0eac4-0262-4eed-97d4-0f2e6f06c8e1",
    image_url: "https://cards.scryfall.io/normal/front/f/5/f5b0eac4-0262-4eed-97d4-0f2e6f06c8e1.jpg?1624593152",
    rarity: "common"
};

