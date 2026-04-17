import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
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
            condition: 'REPARTEE_TRIGGER',
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
    toughness: "3"
};
