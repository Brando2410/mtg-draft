import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const Opt: Record<string, ImplementableCard> = {
    "Opt": {
        name: "Opt",
        manaCost: "{U}",
        oracleText: "Scry 1. (Look at the top card of your library. You may put that card on the bottom.)\nDraw a card.",
        colors: ["blue"],
        supertypes: [],
        types: ["Instant"],
        subtypes: [],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "opt_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                effects: [
                    { type: 'Scry', amount: 1, targetMapping: 'CONTROLLER' },
                    { type: 'DrawCards', amount: 1, targetMapping: 'CONTROLLER' }
                ]
            }
        ]
    }
};
