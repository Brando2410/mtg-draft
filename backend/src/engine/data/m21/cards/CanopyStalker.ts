import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const CanopyStalker: CardDefinition = {
    name: "Canopy Stalker",
    manaCost: "{3}{G}",

    oracleText: "Canopy Stalker must be blocked if able.\nWhen Canopy Stalker dies, you gain 1 life for each creature that died this turn.",
    colors: ["G"],
    types: ["Creature"],
    subtypes: ["Cat", "Elemental"],
    power: "4",
    toughness: "2",
    abilities: [
        {
            type: AbilityType.Static,
            effects: [{ type: EffectType.MustBeBlocked, targetMapping: TargetMapping.Self }]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Death,
            effects: [{ type: EffectType.GainLife, amount: 'CREATURES_DIED_THIS_TURN_COUNT', targetMapping: TargetMapping.Controller }]
        }
    ],
    scryfall_id: "a3f6a13a-ab38-49d1-8712-f9c9135a23c8",
    image_url: "https://cards.scryfall.io/normal/front/a/3/a3f6a13a-ab38-49d1-8712-f9c9135a23c8.jpg?1594736903",
    rarity: "uncommon"
};

