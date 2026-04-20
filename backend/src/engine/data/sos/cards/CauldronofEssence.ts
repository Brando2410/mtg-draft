import { AbilityType, CardDefinition, ConditionType, CostType, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

/**
 * Cauldron of Essence
 * {1}{B}{G}
 * Artifact
 * Whenever a creature you control dies, each opponent loses 1 life and you gain 1 life.
 * {1}{B}{G}, {T}, Sacrifice a creature: Return target creature card from your graveyard to the battlefield. Activate only as a sorcery.
 */
export const CauldronofEssence: CardDefinition = {
    name: "Cauldron of Essence",
    manaCost: "{1}{B}{G}",
    scryfall_id: "b7091740-e70c-4cf2-8d3d-b8e1ac1fbbdd",
    rarity: "rare",
    image_url: "https://cards.scryfall.io/normal/front/b/7/b7091740-e70c-4cf2-8d3d-b8e1ac1fbbdd.jpg?1775938230",
    colors: ["B", "G"],
    types: ["Artifact"],
    oracleText: "Whenever a creature you control dies, each opponent loses 1 life and you gain 1 life.\n{1}{B}{G}, {T}, Sacrifice a creature: Return target creature card from your graveyard to the battlefield. Activate only as a sorcery.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.DeathOther,
            condition: ConditionType.OwnCreatureDies,
            effects: [
                { type: EffectType.LoseLife, amount: 1, targetMapping: TargetMapping.EachOpponent },
                { type: EffectType.GainLife, amount: 1, targetMapping: TargetMapping.Controller }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [
                { type: CostType.Mana, value: '{1}{B}{G}' },
                { type: CostType.Tap },
                { type: CostType.Sacrifice, restrictions: [Restriction.Creature] }
            ],
            activatedOnlyAsSorcery: true,
            targetDefinition: {
                type: TargetType.CardInGraveyard,
                count: 1,
                restrictions: [Restriction.Creature, Restriction.YouControl]
            },
            effects: [
                {
                    type: EffectType.PutOnBattlefield,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ]
};
