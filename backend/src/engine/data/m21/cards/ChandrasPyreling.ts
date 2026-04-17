import { AbilityType, CardDefinition, DurationType, EffectType, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

export const ChandrasPyreling: CardDefinition = {
    name: "Chandra's Pyreling",
    manaCost: "{1}{R}",
    scryfall_id: "e7744fcf-2336-489d-bc05-f3fce78713a9",
    image_url: "https://cards.scryfall.io/normal/front/e/7/e7744fcf-2336-489d-bc05-f3fce78713a9.jpg?1594736559",
    oracleText: "Whenever an opponent is dealt noncombat damage, Chandra's Pyreling gets +1/+0 and gains double strike until end of turn. (This ability triggers for each time they're dealt noncombat damage.)",
    colors: ["R"],
    types: ["Creature"],
    subtypes: ["Elemental", "Lizard"],
    power: "1",
    toughness: "3",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.DamageDealtToPlayer,
            condition: 'EVENT_PLAYER_IS_OPPONENT && EVENT_IS_NONCOMBAT',
            effects: [
                {
                    type: EffectType.ApplyContinuousEffect,
                    powerModifier: 1,
                    abilitiesToAdd: ["Double Strike"],
                    duration: { type: DurationType.UntilEndOfTurn },
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ]
};

