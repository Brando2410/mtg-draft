import { AbilityType, CardDefinition, CostType, EffectType, Restriction, TargetMapping, TargetType, Zone } from '@shared/engine_types';

export const NecroticFumes: CardDefinition = {
    name: 'Necrotic Fumes',
    manaCost: '{1}{B}',
    colors: ['B'],
    types: ['Sorcery'],
    subtypes: ['Lesson'],
    oracleText: 'As an additional cost to cast this spell, exile a creature you control.\nExile target creature or planeswalker.',
    abilities: [
        {
            type: AbilityType.Spell,
            costs: [{ type: CostType.Exile, amount: 1, restrictions: [Restriction.Creature, Restriction.YouControl] }],
            targetDefinitions: [{ count: 1, type: TargetType.CreatureOrPlaneswalker }],
            effects: [{ type: EffectType.Exile, targetMapping: TargetMapping.Target1 }]
        }
    ],
    scryfall_id: "5e1b68a4-fb8d-4b59-b049-73505296f775",
    image_url: "https://cards.scryfall.io/normal/front/5/e/5e1b68a4-fb8d-4b59-b049-73505296f775.jpg?1637082347",
    rarity: "uncommon"
};

