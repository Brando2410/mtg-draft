import { AbilityType, CardDefinition, CostType, DurationType, EffectType, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const StoneriseSpirit: CardDefinition = {
    name: 'Stonerise Spirit',
    manaCost: '{1}{W}',
    colors: ['W'],
    types: ['Creature'],
    subtypes: ['Spirit', 'Bird'],
    power: "1",
    toughness: "2",
    keywords: ['Flying'],
    oracleText: 'Flying\n{4}, Exile Stonerise Spirit from your graveyard: Target creature gains flying until end of turn.',
    abilities: [
        {
            type: AbilityType.Activated,
            activeZone: Zone.Graveyard,
            costs: [
                { type: CostType.Mana, value: '{4}' },
                { type: CostType.ExileSelf }
            ],
            targetDefinitions: [{ count: 1, type: TargetType.Creature }],
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                targetMapping: TargetMapping.Target1,
                duration: { type: DurationType.UntilEndOfTurn },
                abilitiesToAdd: ['Flying']
            }]
        }
    ],
    scryfall_id: "388f2e45-570f-4a35-b205-37e1345b5d06",
    image_url: "https://cards.scryfall.io/normal/front/3/8/388f2e45-570f-4a35-b205-37e1345b5d06.jpg?1624589838",
    rarity: "common"
};

