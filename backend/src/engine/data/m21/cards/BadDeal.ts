import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const BadDeal: Record<string, ImplementableCard> = {
    "Bad Deal": {
        name: "Bad Deal",
        manaCost: "{4}{B}{B}",
        oracleText: "You draw two cards and each opponent discards two cards. Each player loses 2 life.",
        colors: ["black"],
        supertypes: [],
        types: ["Sorcery"],
        subtypes: [],
        power: undefined,
        toughness: undefined,
        keywords: [],
        abilities: [
            {
                id: "bad_deal_spell",
                type: AbilityType.Spell,
                activeZone: ZoneRequirement.Stack,
                effects: [
                    { type: 'DrawCards', amount: 2, targetMapping: 'CONTROLLER' },
                    { type: 'DiscardCards', amount: 2, targetMapping: 'EACH_OPPONENT' },
                    { type: 'LoseLife', amount: 2, targetMapping: 'EACH_PLAYER' }
                ]
            }
        ]
    }
};
