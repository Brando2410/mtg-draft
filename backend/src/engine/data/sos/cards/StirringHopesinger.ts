import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
export const StirringHopesinger: CardDefinition = {
    name: "Stirring Hopesinger",
    manaCost: "{2}{W}",
    colors: [
        "W"
    ],
    types: [
        "Creature"
    ],
    subtypes: [
        "Bird",
        "Bard"
    ],
    keywords: ["Flying", "Lifelink", "Repartee"],
    oracleText: "Flying, lifelink\nRepartee — Whenever you cast an instant or sorcery spell that targets a creature, put a +1/+1 counter on each creature you control.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastInstantOrSorcery,
            condition: ConditionType.ReparteeTrigger,
            effects: [
                {
                    type: EffectType.AddCounters,
                    counterType: '+1/+1',
                    amount: 1,
                    targetMapping: TargetMapping.AllCreaturesYouControl
                }
            ]
        }
    ],
    power: "1",
    toughness: "3",
    scryfall_id: "21375667-b318-47f8-a482-9c8c2b5b14c0",
    image_url: "https://cards.scryfall.io/normal/front/2/1/21375667-b318-47f8-a482-9c8c2b5b14c0.jpg?1775937157",
    rarity: "rare"
};

