import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';
export const ScoldingAdministrator: CardDefinition = {
    name: "Scolding Administrator",
    manaCost: "{W}{B}",
    colors: ["B", "W"],
    types: ["Creature"],
    subtypes: ["Dwarf", "Cleric"],
    keywords: ["Menace"],
    oracleText: "Menace (This creature can't be blocked except by two or more creatures.)\nRepartee — Whenever you cast an instant or sorcery spell that targets a creature, put a +1/+1 counter on this creature.\nWhen this creature dies, if it had counters on it, put those counters on up to one target creature.",
    power: "2",
    toughness: "2",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastInstantOrSorcery,
            condition: ConditionType.ReparteeTrigger,
            effects: [
                {
                    type: EffectType.AddCounters,
                    amount: 1,
                    counterType: '+1/+1',
                    targetMapping: TargetMapping.Self
                }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.Death,
            condition: ConditionType.HasCounters,
            targetDefinitions: [{
                type: TargetType.Creature,
                count: 1,
                optional: true
            }],
            effects: [
                {
                    type: EffectType.MoveCounters,
                    targetMapping: TargetMapping.Target1
                }
            ]
        }
    ],
    scryfall_id: "69757177-aefa-44a6-81db-5ae9b5d2f117",
    image_url: "https://cards.scryfall.io/normal/front/6/9/69757177-aefa-44a6-81db-5ae9b5d2f117.jpg?1775938562",
    rarity: "uncommon"
};

