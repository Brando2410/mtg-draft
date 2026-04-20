import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const CanopyStalker: CardDefinition = {
    name: "Canopy Stalker",
    manaCost: "{3}{G}",
    scryfall_id: "f882103f-4228-444d-bbb9-323f6e16698b",
    image_url: "https://cards.scryfall.io/normal/front/f/8/f882103f-4228-444d-bbb9-323f6e16698b.jpg?1594736916",
    oracleText: "Canopy Stalker must be blocked if able.\nWhen Canopy Stalker dies, you gain 1 life for each creature that died this turn.",
    colors: ["G"],
    types: ["Creature"],
    subtypes: ["Cat", "Elemental"],
    power: "4",
    toughness: "2",
    abilities: [
        {
            type: AbilityType.Static,
            restr

        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Death,
            effects: [{ type: EffectType.GainLife, amount: 'CREATURES_DIED_THIS_TURN_COUNT', targetMapping: TargetMapping.Controller }]
        }
    ]
};
