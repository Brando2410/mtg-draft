import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

export const SilversmoteGhoul: CardDefinition = {
    name: "Silversmote Ghoul",
    manaCost: "{2}{B}",
    scryfall_id: "ff544e7d-22d2-49e3-8e7c-96c34dcb1f3f",
    image_url: "https://cards.scryfall.io/normal/front/f/f/ff544e7d-22d2-49e3-8e7c-96c34dcb1f3f.jpg?1594736374",
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
            condition: 'OUR_TURN_AND_LIFE_GAINED_3_OR_MORE_THIS_TURN',
            effects: [{ type: EffectType.PutOnBattlefield, targetMapping: TargetMapping.Self, tapped: true }]
        },
        {
            type: AbilityType.Activated,
            costs: [
                { type: CostType.Mana, value: '{1}{B}' },
                { type: CostType.Sacrifice, targetMapping: TargetMapping.Self }
            ],
            effects: [{ type: EffectType.DrawCards, amount: 1, targetMapping: TargetMapping.Controller }]
        }
    ]
};
