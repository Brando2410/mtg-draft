import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const LecturingScornmage: CardDefinition = {
    name: "Lecturing Scornmage",
    manaCost: "{B}",
    scryfall_id: "ad07091e-8c24-43af-8ce8-031847bcaf30",
    rarity: "uncommon",
    image_url: "https://cards.scryfall.io/normal/front/a/d/ad07091e-8c24-43af-8ce8-031847bcaf30.jpg?1775937516",
    colors: [
        "B"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Human",
        "Warlock"
    ],
    keywords: ["Repartee"],
    oracleText: "Repartee — Whenever you cast an instant or sorcery spell that targets a creature, put a +1/+1 counter on this creature.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastInstantOrSorcery,
            condition: ConditionType.ReparteeTrigger,
            effects: [
                {
                    type: EffectType.AddCounters,
                    counterType: 'P1P1',
                    amount: 1,
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
    power: "1",
    toughness: "1"
};
