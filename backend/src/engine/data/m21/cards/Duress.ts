import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const Duress: CardDefinition = {
    name: 'Duress',
    manaCost: '{B}',

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
    ],
    scryfall_id: "34c3a894-ee75-4db9-a69f-711bb3cc150a",
    image_url: "https://cards.scryfall.io/normal/front/3/4/34c3a894-ee75-4db9-a69f-711bb3cc150a.jpg?1730490899",
    rarity: "common"
};

