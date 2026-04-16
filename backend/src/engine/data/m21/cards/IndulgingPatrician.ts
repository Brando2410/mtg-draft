import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

export const IndulgingPatrician: CardDefinition = {
    name: "Indulging Patrician",
    manaCost: "{1}{W}{B}",
    oracleText: "Flying, lifelink\nAt the beginning of your end step, if you gained 3 or more life this turn, each opponent loses 3 life.",
    colors: ["W", "B"],
    types: ["Creature"],
    subtypes: ["Vampire", "Knight"],
    power: "1",
    toughness: "4",
    keywords: ["Flying", "Lifelink"],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EndStep,
            activeZone: Zone.Battlefield,
            condition: 'IS_YOUR_TURN && LIFE_GAINED_3_OR_MORE_THIS_TURN',
            effects: [{
                type: EffectType.LoseLife,
                amount: 3,
                targetMapping: TargetMapping.EachOpponent
            }]
        }
    ]
};

