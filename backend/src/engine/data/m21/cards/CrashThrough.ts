import { AbilityType, CardDefinition, EffectType } from '@shared/engine_types';

export const CrashThrough: CardDefinition = {
        name: "Crash Through",
        manaCost: "{R}",
    scryfall_id: "8257c205-00cd-4d41-bd58-098575ea2343",
    image_url: "https://cards.scryfall.io/normal/front/8/2/8257c205-00cd-4d41-bd58-098575ea2343.jpg?1594736580",
        oracleText: "Creatures you control gain trample until end of turn. (Each of those creatures can deal excess combat damage to the player or planeswalker it's attacking.)\nDraw a card.",
        colors: ["red"],
        supertypes: [],
        types: ["Sorcery"],
        subtypes: [],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "crash_through_spell",
                type: AbilityType.Spell,
                effects: [
                    { type: EffectType.ApplyContinuousEffect, abilitiesToAdd: ['Trample'], duration: 'UNTIL_END_OF_TURN', layer: 6, targetMapping: 'ALL_CREATURES_YOU_CONTROL' },
                    { type: EffectType.DrawCards, amount: 1, targetMapping: 'CONTROLLER' }
                ]
            }
        ]
    };


