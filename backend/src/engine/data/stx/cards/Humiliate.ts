import { AbilityType, CardDefinition, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const Humiliate: CardDefinition = {
    name: 'Humiliate',
    manaCost: '{W}{B}',
    scryfall_id: "dc3ae8cb-fbdb-45a8-83c2-cbf4aff01f90",
    image_url: "https://cards.scryfall.io/normal/front/d/c/dc3ae8cb-fbdb-45a8-83c2-cbf4aff01f90.jpg?1627429247",
    colors: ['W', 'B'],
    types: ['Sorcery'],
    oracleText: 'Target opponent reveals their hand. You choose a nonland card from it. That player discards that card. Put a +1/+1 counter on a creature you control.',
    abilities: [
        {
            type: AbilityType.Spell,
            targetDefinition: {
                count: 1,
                type: TargetType.Opponent
            },
            effects: [
                {
                    type: EffectType.Choice,
                    label: "Choose a nonland card to discard",
                    targetIdMapping: 'TARGET_1_HAND_REVEAL_PICK',
                    restrictions: ['nonland'],
                    effects: [{ type: EffectType.MoveToZone, zone: Zone.Graveyard, isDiscard: true }]
                },
                {
                    type: EffectType.AddCounters,
                    counterType: 'P1P1',
                    amount: 1,
                    targetDefinition: {
                        count: 1,
                        type: TargetType.Creature,
                        restrictions: ['yours']
                    },
                    targetMapping: TargetMapping.Target2
                }
            ]
        }
    ]
};
