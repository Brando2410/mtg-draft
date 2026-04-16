import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

export const DeathlessKnight: CardDefinition = {
    name: "Deathless Knight",
    manaCost: "{B/G}{B/G}{B/G}{B/G}",
    oracleText: "Haste\nWhen you gain life, you may return Deathless Knight from your graveyard to your hand.",
    colors: ["B", "G"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Skeleton", "Knight"],
    power: "4",
    toughness: "2",
    keywords: ["Haste"],
    set: "ELD",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.LifeGain,
            activeZone: Zone.Graveyard,
            condition: 'EVENT_PLAYER_IS_YOU',
            effects: [{ type: EffectType.ReturnToHand, targetMapping: TargetMapping.Self }]
        }
    ]
};



