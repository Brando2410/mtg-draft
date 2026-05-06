import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const MageHunter: CardDefinition = {
    name: 'Mage Hunter',
    manaCost: '{3}{B}',
    scryfall_id: "56fcbe4a-2d98-4fa9-a6c3-e28255171a4d",
    image_url: "https://cards.scryfall.io/normal/front/5/6/56fcbe4a-2d98-4fa9-a6c3-e28255171a4d.jpg?1624591098",
    colors: ['B'],
    types: ['Creature'],
    subtypes: ['Horror'],
    power: "3",
    toughness: "4",
    oracleText: 'Whenever an opponent casts or copies an instant or sorcery spell, they lose 1 life.',
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.MagecraftOpponent,
            effects: [{ type: EffectType.LoseLife, amount: 1, targetMapping: TargetMapping.TriggerController }]
        }
    ]
};


