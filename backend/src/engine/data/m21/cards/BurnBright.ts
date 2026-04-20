import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping } from '@shared/engine_types';

export const BurnBright: CardDefinition = {
    name: "Burn Bright",
    manaCost: "{2}{R}",
    scryfall_id: "f19b4a80-41e1-4c5f-869a-682f08543f12",
    image_url: "https://cards.scryfall.io/normal/front/f/1/f19b4a80-41e1-4c5f-869a-682f08543f12.jpg?1594736518",
    oracleText: "Creatures you control get +2/+0 until end of turn.",
    colors: ["R"],
    types: ["Instant"],
    abilities: [
        {
            type: AbilityType.Spell,
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                powerModifier: 2,
                toughnessModifier: 0,
                duration: { type: DurationType.UntilEndOfTurn },
                layer: 7,
                targetMapping: TargetMapping.AllCreaturesYouControl
            }]
        }
    ]
};
