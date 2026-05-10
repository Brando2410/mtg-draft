import { AbilityType, CardDefinition, ConditionType, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const ChandrasIncinerator: CardDefinition = {
    name: "Chandra's Incinerator",
    manaCost: "{5}{R}",

    oracleText: "This spell costs {X} less to cast, where X is the total amount of noncombat damage dealt to your opponents this turn.\nTrample\nWhenever a source you control deals noncombat damage to an opponent, Chandra's Incinerator deals that much damage to target creature or planeswalker that player controls.",
    colors: ["R"],
    types: ["Creature"],
    subtypes: ["Elemental"],
    power: "6",
    toughness: "6",
    keywords: ["Trample"],
    abilities: [
        {
            type: AbilityType.Static,
            activeZone: Zone.Hand,
            effects: [{
                type: EffectType.CostReduction,
                amount: 'NONCOMBAT_DAMAGE_DEALT_OPPONENTS_THIS_TURN',
                targetMapping: TargetMapping.Self
            }]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.DamageDealtToPlayer, //missing condition,
            targetDefinitions: [{
                type: TargetType.CreatureOrPlaneswalker,
                count: 1,
                restrictions: [Restriction.OpponentControl]
            }],
            effects: [{
                type: EffectType.DealDamage,
                amount: 'EVENT_AMOUNT',
                targetMapping: TargetMapping.Target1
            }]
        }
    ],
    scryfall_id: "ed875705-b7b6-4464-b16f-61629ffed04f",
    image_url: "https://cards.scryfall.io/normal/front/e/d/ed875705-b7b6-4464-b16f-61629ffed04f.jpg?1594736535",
    rarity: "rare"
};

