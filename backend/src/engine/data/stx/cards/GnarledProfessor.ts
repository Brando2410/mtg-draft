import { AbilityType, CardDefinition, DynamicAmount, EffectType, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';

export const GnarledProfessor: CardDefinition = {
        name: "Gnarled Professor",
        manaCost: "{2}{G}{G}",
    scryfall_id: "a32338e8-1f6a-49b9-bd93-26578adab6b3",
    image_url: "https://cards.scryfall.io/normal/front/a/3/a32338e8-1f6a-49b9-bd93-26578adab6b3.jpg?1624592799",
        colors: ["G"],
        types: ["Creature"],
        subtypes: ["Treefolk", "Druid"],
        power: "5",
        toughness: "4",
        keywords: ["Trample"],
        oracleText: "Trample\nWhen Gnarled Professor enters the battlefield, learn.",
        abilities: [
            {
                type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.EnterBattlefield,
                effects: [{ type: EffectType.Learn }]
            }
        ]
    };


