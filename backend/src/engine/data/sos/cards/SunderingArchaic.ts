import { AbilityType, CardDefinition, CostType, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';
export const SunderingArchaic: CardDefinition = {
    name: "Sundering Archaic",
    manaCost: "{6}",
    colors: [],
    types: [
        "Creature"
    ],
    subtypes: [
        "Avatar"
    ],
    keywords: [],
    oracleText: "Converge — When this creature enters, exile target nonland permanent an opponent controls with mana value less than or equal to the number of colors of mana spent to cast this creature.\n{2}: Put target card from a graveyard on the bottom of its owner's library.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            targetDefinitions: [{
                count: 1,
                type: TargetType.NonlandPermanent,
                restrictions: [
                    "opponentcontrol",
                    "mv <= converge_amount"
                ]
            }],
            effects: [
                {
                    type: CostType.Exile,
                    targetMapping: TargetMapping.Target1
                }
            ]
        },
        {
            type: AbilityType.Activated,
            costs: [{ type: CostType.Mana, value: '{2}' }],
            targetDefinitions: [{
                count: 1,
                type: TargetType.CardInGraveyard
            }],
            effects: [
                {
                    type: EffectType.MoveToZone,
                    zone: Zone.Library,
                    position: 'bottom',
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ],
    power: "3",
    toughness: "3",
    scryfall_id: "c35b57e4-2358-46c0-8f09-cd27c10eaf2d",
    image_url: "https://cards.scryfall.io/normal/front/c/3/c35b57e4-2358-46c0-8f09-cd27c10eaf2d.jpg?1775936933",
    rarity: "uncommon"
};

