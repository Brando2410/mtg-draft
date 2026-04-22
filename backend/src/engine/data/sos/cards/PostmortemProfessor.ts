import { AbilityType, CardDefinition, ConditionType, CostType, EffectType, Restriction, RestrictionType, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

export const PostmortemProfessor: CardDefinition = {
    name: "Postmortem Professor",
    manaCost: "{1}{B}",
    scryfall_id: "174f5d7e-5d36-4d13-96bf-9b12cd644716",
    rarity: "rare",
    image_url: "https://cards.scryfall.io/normal/front/1/7/174f5d7e-5d36-4d13-96bf-9b12cd644716.jpg?1775937558",
    colors: ["B"],
    types: ["Creature"],
    subtypes: ["Zombie", "Warlock"],
    power: 2,
    toughness: 2,
    oracleText: "This creature can't block.\nWhenever this creature attacks, each opponent loses 1 life and you gain 1 life.\n{1}{B}, Exile an instant or sorcery card from your graveyard: Return this card from your graveyard to the battlefield.",
    abilities: [
        {
            type: AbilityType.Static,
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                layer: 6,
                targetMapping: TargetMapping.Self,
                restrictionsToAdd: [{ type: RestrictionType.CannotBlock }]
            }]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Attack,
            condition: ConditionType.EventSourceIsSelf,
            effects: [
                { type: EffectType.LoseLife, amount: 1, targetMapping: TargetMapping.EachOpponent },
                { type: EffectType.GainLife, amount: 1, targetMapping: TargetMapping.Controller }
            ]
        },
        {
            type: AbilityType.Activated,
            activeZone: Zone.Graveyard,
            costs: [
                { type: CostType.Mana, value: '{1}{B}' },
                {
                    type: CostType.Exile,
                    sourceZones: ['Graveyard'],
                    restrictions: [Restriction.InstantOrSorcery]
                }
            ],
            effects: [
                {
                    type: EffectType.MoveToZone,
                    zone: Zone.Battlefield,
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
};
