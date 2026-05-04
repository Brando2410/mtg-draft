import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const Duress: CardDefinition = {
    name: 'Duress',
    manaCost: '{B}',
    scryfall_id: "49c07ea0-27ff-46fb-a41f-3e378c977b5d",
    image_url: "https://cards.scryfall.io/normal/front/4/9/49c07ea0-27ff-46fb-a41f-3e378c977b5d.jpg?1594736092",
    colors: ['B'],
    types: ['Sorcery'],
    oracleText: 'Target opponent reveals their hand. You choose a noncreature, nonland card from it. That player discards that card.',
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinitions: [{
                count: 1,
                type: TargetType.Player,
                restrictions: [Restriction.Opponent]
            }],
            effects: [
                {
                    type: EffectType.Choice,
                    label: "Choose a noncreature, nonland card to discard",
                    selectionPool: TargetMapping.Target1HandRevealPick,
                    restrictions: [
                        Restriction.NonCreature,
                        Restriction.NonLand
                    ],
                    effects: [{ type: EffectType.MoveToZone, zone: Zone.Graveyard, isDiscard: true }]
                }
            ]
        }
    ]
};
