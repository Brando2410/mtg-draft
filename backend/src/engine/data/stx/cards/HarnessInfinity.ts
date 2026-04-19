import { AbilityType, CardDefinition, EffectType, TargetMapping } from '@shared/engine_types';

export const HarnessInfinity: CardDefinition = {
    name: "Harness Infinity",
    manaCost: "{1}{B}{B}{B}{G}{G}{G}",
    scryfall_id: "f74120ce-9f11-449f-bb72-04fe2a27a9f6",
    image_url: "https://cards.scryfall.io/normal/front/f/7/f74120ce-9f11-449f-bb72-04fe2a27a9f6.jpg?1627429142",
    colors: ["B", "G"],
    types: ["Instant"],
    oracleText: "Exchange your hand and graveyard. Exile Harness Infinity.",
    abilities: [{
        type: AbilityType.Spell,
        effects: [
            { type: EffectType.ExchangeHandAndGraveyard, targetMapping: TargetMapping.Controller },
            { type: EffectType.Exile, targetMapping: TargetMapping.Self }
        ]
    }]
};

