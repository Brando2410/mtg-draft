import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const BasrisAcolyte: CardDefinition = {
    name: "Basri's Acolyte",
    manaCost: "{2}{W}{W}",
    scryfall_id: "08d1dd97-2675-4953-ab95-d47d23abfe05",
    image_url: "https://cards.scryfall.io/normal/front/0/8/08d1dd97-2675-4953-ab95-d47d23abfe05.jpg?1594734783",
    oracleText: "Lifelink (Damage dealt by this creature also causes you to gain that much life.)\nWhen this creature enters, put a +1/+1 counter on each of up to two other target creatures you control.",
    colors: ["W"],
    types: ["Creature"],
    subtypes: ["Cat", "Cleric"],
    power: "2",
    toughness: "3",
    keywords: ["Lifelink"],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            targetDefinition: {
                type: TargetType.Creature,
                count: 2,
                minCount: 0,
                optional: true,
                restrictions: [
                    Restriction.Other,
                    Restriction.YouControl
                ]
            },
            effects: [{
                type: EffectType.AddCounters,
                amount: 1,
                counterType: 'P1P1',
                targetMapping: TargetMapping.Target1
            }],
        }
    ]
};
