import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from "@shared/engine_types";

export const HoodedBlightfang: Record<string, ImplementableCard> = {
    "Hooded Blightfang": {
        name: "Hooded Blightfang",
        manaCost: "{2}{B}",
        oracleText: "Deathtouch\nWhenever a creature you control with deathtouch attacks, each opponent loses 1 life and you gain 1 life.\nWhenever a creature you control with deathtouch deals damage to a planeswalker, destroy that planeswalker.",
        colors: ["black"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Snake"],
        power: "1",
        toughness: "4",
        keywords: ["Deathtouch"],
        abilities: [
            {
                id: "hooded_blightfang_attack_trigger",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ATTACKS',
                activeZone: ZoneRequirement.Battlefield,
                // Condition: attacker has deathtouch and is controlled by you
                effects: [
                    { type: EffectType.LoseLife, amount: 1, targetMapping: 'OPPONENTS' },
                    { type: EffectType.GainLife, amount: 1, targetMapping: 'CONTROLLER' }
                ]
            }
        ]
    }
};
