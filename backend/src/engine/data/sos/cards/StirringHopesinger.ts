import { CardDefinition, AbilityType, TriggerEvent, EffectType, TargetMapping } from '@shared/engine_types';

export const StirringHopesinger: CardDefinition = {
    "name": "Stirring Hopesinger",
    "manaCost": "{2}{W}",
    "colors": [
        "W"
    ],
    "types": [
        "Creature"
    ],
    "subtypes": [
        "Bird",
        "Bard"
    ],
    "oracleText": "Flying, lifelink\nRepartee — Whenever you cast an instant or sorcery spell that targets a creature, put a +1/+1 counter on each creature you control.",
    "keywords": ["Flying", "Lifelink", "Repartee"],
    "abilities": [
        {
            type: AbilityType.Triggered,
            id: "Repartee",
                    eventMatch: TriggerEvent.CastSpell,
            condition: 'REPARTEE_TRIGGER',
            effects: [
                {
                    type: EffectType.AddCounters,
                    counterType: 'p1p1',
                    amount: 1,
                    targetMapping: TargetMapping.AllCreaturesYouControl
                }
            ]
        }
    ],
    "power": "1",
    "toughness": "3"
};





