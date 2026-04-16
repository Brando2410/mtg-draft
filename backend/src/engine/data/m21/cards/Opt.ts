import { AbilityType, ZoneRequirement, Zone, EffectType, TargetType, TargetMapping, CardDefinition } from '@shared/engine_types';

export const Opt: CardDefinition = {
    name: "Opt",
    manaCost: "{U}",
    oracleText: "Scry 1. (Look at the top card of your library. You may put that card on the bottom.)\nDraw a card.",
    colors: ["U"],
    supertypes: [],
    types: ["Instant"],
    subtypes: [],
    keywords: [],
    abilities: [
        {
            id: "opt_spell",
            type: AbilityType.Spell,
            activeZone: ZoneRequirement.Stack,
            effects: [
                { type: EffectType.Scry, amount: 1, targetMapping: TargetMapping.Controller },
                { type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller }
            ]
        }
    ]
};
