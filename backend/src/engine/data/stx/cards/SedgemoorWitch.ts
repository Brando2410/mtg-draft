import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const SedgemoorWitch: CardDefinition = {
    name: 'Sedgemoor Witch',
    manaCost: '{2}{B}',
    colors: ['B'],
    types: ['Creature'],
    subtypes: ['Human', 'Warlock'],
    power: "3",
    toughness: "2",
    keywords: ['Menace', 'Ward—Pay 3 life'],
    oracleText: 'Menace\nWard — Pay 3 life.\nMagecraft — Whenever you cast or copy an instant or sorcery spell, create a 1/1 black and green Pest creature token with "When this creature dies, you gain 1 life."',
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Magecraft,
            effects: [
                {
                    type: EffectType.CreateToken,
                    tokenBlueprint: {
                        name: 'Pest',
                        manaCost: '',
                        colors: ['B', 'G'],
                        types: ['Creature', 'Token'],
                        subtypes: ['Pest'],
                        power: "1",
                        toughness: "1",
                        oracleText: 'When this creature dies, you gain 1 life.',
                        abilities: [{
                            type: AbilityType.Triggered,
                            eventMatch: TriggerEvent.Death,
                            effects: [{ type: EffectType.GainLife, amount: 1, targetMapping: TargetMapping.Controller }]
                        }]
                    },
                    amount: 1
                }
            ]
        }
    ],
    scryfall_id: "e900c1eb-968b-4046-b824-c167a7a5b682",
    image_url: "https://cards.scryfall.io/normal/front/e/9/e900c1eb-968b-4046-b824-c167a7a5b682.jpg?1624591402",
    rarity: "rare"
};

