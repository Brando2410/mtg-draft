import { AbilityType, CardDefinition, ConditionType, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';
export const ForumNecroscribe: CardDefinition = {
    name: "Forum Necroscribe",
    manaCost: "{5}{B}",


    colors: ["B"],
    types: ["Creature"],
    subtypes: ["Troll", "Warlock"],
    power: "5",
    toughness: "4",
    keywords: ["Ward—Discard a card"],
    oracleText: "Ward—Discard a card.\nRepartee — Whenever you cast an instant or sorcery spell that targets a creature, return target creature card from your graveyard to the battlefield.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastInstantOrSorcery,
            condition: ConditionType.ReparteeTrigger,
            effects: [
                {
                    type: EffectType.Choice,
                    label: "Choose a creature card to return on the battlefield",
                    selectionPool: TargetMapping.ControllerGraveyard,
                    targetDefinitions: [{
                        type: TargetType.CardInGraveyard,
                        restrictions: [Restriction.Creature, Restriction.YouOwn]
                    }],
                    effects: [
                        {
                            type: EffectType.MoveToZone,
                            zone: Zone.Battlefield
                        }
                    ]
                }
            ]
        }
    ],
    scryfall_id: "67504a12-7414-4209-bf1c-624b4db19d52",
    image_url: "https://cards.scryfall.io/normal/front/6/7/67504a12-7414-4209-bf1c-624b4db19d52.jpg?1775937497",
    rarity: "uncommon"
};

