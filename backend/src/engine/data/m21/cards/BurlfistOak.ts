import { AbilityType, CardDefinition, ConditionType, DurationType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const BurlfistOak: CardDefinition = {
    name: "Burlfist Oak",
    manaCost: "{2}{G}{G}",

    oracleText: "Whenever you draw a card, this creature gets +2/+2 until end of turn.",
    colors: ["G"],
    types: ["Creature"],
    subtypes: ["Treefolk"],
    power: "2",
    toughness: "3",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Draw,
            condition: ConditionType.EventPlayerIsYou,
            effects: [{
                type: EffectType.ApplyContinuousEffect,
                duration: { type: DurationType.UntilEndOfTurn },
                powerModifier: 2,
                toughnessModifier: 2,
                layer: 7,
                targetMapping: TargetMapping.Self
            }]
        }
    ],
    scryfall_id: "3d0ec3bd-d894-4861-abcb-7b2e4f4de05c",
    image_url: "https://cards.scryfall.io/normal/front/3/d/3d0ec3bd-d894-4861-abcb-7b2e4f4de05c.jpg?1594736896",
    rarity: "uncommon"
};

