import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const DeathlessKnight: Record<string, ImplementableCard> = {
    "Deathless Knight": {
        name: "Deathless Knight",
        manaCost: "{B/G}{B/G}{B/G}{B/G}",
        oracleText: "Haste\nWhen you gain life, you may return Deathless Knight from your graveyard to your hand.",
        colors: ["black","green"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Skeleton","Knight"],
        power: "4",
        toughness: "2",
        keywords: ["Haste"],
        set: "ELD",
        abilities: [
            {
                id: "deathless_knight_trigger",

                type: AbilityType.Triggered,
                    eventMatch: 'ON_LIFE_GAIN',
                activeZone: ZoneRequirement.Graveyard,
                condition: (state: any, event: any, source: any) => event.playerId === source.controllerId,
                effects: [{ type: 'ReturnToHand', targetMapping: 'SELF' }]
            }
        ]
    }
};

