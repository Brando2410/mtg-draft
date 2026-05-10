import { AbilityType, CardDefinition, ConditionType, CostType, EffectType, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

export const SilversmoteGhoul: CardDefinition = {
    name: "Silversmote Ghoul",
    manaCost: "{2}{B}",

    oracleText: "At the beginning of your end step, if you gained 3 or more life this turn, return Silversmote Ghoul from your graveyard to the battlefield tapped.\n{1}{B}, Sacrifice Silversmote Ghoul: Draw a card.",
    colors: ["B"],
    types: ["Creature"],
    subtypes: ["Zombie", "Vampire"],
    power: "3",
    toughness: "1",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EndStep,
            activeZone: Zone.Graveyard,
            condition: `${ConditionType.IsYourTurn} && ${ConditionType.LifeGained3OrMoreThisTurn}`,
            effects: [{ type: EffectType.PutOnBattlefield, targetMapping: TargetMapping.Self, tapped: true }]
        },
        {
            type: AbilityType.Activated,
            costs: [
                { type: CostType.Mana, value: '{1}{B}' },
                { type: CostType.SacrificeSelf }
            ],
            effects: [{ type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller }]
        }
    ],
    scryfall_id: "c50a8053-7e79-4e0f-8e72-8df089377cd1",
    image_url: "https://cards.scryfall.io/normal/front/c/5/c50a8053-7e79-4e0f-8e72-8df089377cd1.jpg?1625193403",
    rarity: "uncommon"
};

