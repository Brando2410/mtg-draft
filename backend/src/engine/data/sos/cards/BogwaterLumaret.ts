import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
export const BogwaterLumaret: CardDefinition = {
    name: "Bogwater Lumaret",
    manaCost: "{B}{G}",
    scryfall_id: "7a42f51a-3377-47bb-b6fb-c0515bf1dcfb",
    rarity: "common",
    image_url: "https://cards.scryfall.io/normal/front/7/a/7a42f51a-3377-47bb-b6fb-c0515bf1dcfb.jpg?1775938216",
    colors: ["B", "G"],
    types: ["Creature"],
    subtypes: ["Spirit", "Frog"],
    keywords: [],
    power: "2",
    toughness: "2",
    oracleText: "Whenever this creature or another creature you control enters, you gain 1 life.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: [TriggerEvent.EnterBattlefield, TriggerEvent.EnterBattlefieldOther],
            condition: ConditionType.OwnCreatureEnters,
            effects: [
                {
                    type: EffectType.GainLife,
                    amount: 1,
                    targetMapping: TargetMapping.Controller
                }
            ]
        }
    ]
};

