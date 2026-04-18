import { TargetMapping, AbilityType, CardDefinition, ConditionType, EffectType, TargetType, TriggerEvent } from '@shared/engine_types';
export const OldGrowthEducator: CardDefinition = {
    name: "Old-Growth Educator",
    manaCost: "{2}{B}{G}",
    scryfall_id: "eb7e858a-9b85-49b2-a379-ee656b64935a",
    image_url: "https://cards.scryfall.io/normal/front/e/b/eb7e858a-9b85-49b2-a379-ee656b64935a.jpg?1775938438",
    colors: ["B", "G"],
    types: ["Creature"],
    subtypes: ["Treefolk", "Druid"],
    keywords: ["Vigilance", "Reach", "Infusion"],
    power: "4",
    toughness: "4",
    oracleText: "Vigilance, reach\nInfusion — When this creature enters, put two +1/+1 counters on it if you gained life this turn.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            condition: ConditionType.Infusion,
            effects: [
                {
                    type: EffectType.AddCounters,
                    counterType: '+1/+1',
                    amount: 2,
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ]
};

