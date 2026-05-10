import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

export const StormwingEntity: CardDefinition = {
    name: "Stormwing Entity",
    manaCost: "{3}{U}{U}",

    oracleText: "This spell costs {2}{U} to cast if you've cast an instant or sorcery spell this turn.\nFlying\nWhen this creature enters, scry 2.\nProwess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)",
    colors: ["U"],
    types: ["Creature"],
    subtypes: ["Elemental", "Siren"],
    power: "3",
    toughness: "3",
    keywords: ["Flying", "Prowess"],
    abilities: [
        {
            type: AbilityType.Static,
            activeZone: Zone.Hand,
            effects: [
                {
                    type: EffectType.CostReduction,
                    targetMapping: TargetMapping.Self,
                    reductionAmount: '{1}{U}',
                    condition: ConditionType.CastInstantSorceryThisTurn
                }
            ]
        },
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            effects: [{ type: EffectType.Scry, amount: 2, targetMapping: TargetMapping.Controller }]
        }
    ],
    scryfall_id: "0540ee72-6370-4f70-9526-6f441b3cac1e",
    image_url: "https://cards.scryfall.io/normal/front/0/5/0540ee72-6370-4f70-9526-6f441b3cac1e.jpg?1594735784",
    rarity: "rare"
};

