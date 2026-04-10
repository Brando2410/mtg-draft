import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, DurationType } from "@shared/engine_types";

export const RadhaHeartofKeld: Record<string, ImplementableCard> = {
    "Radha, Heart of Keld": {
        name: "Radha, Heart of Keld",
        manaCost: "{1}{R}{G}",
        oracleText: "As long as it's your turn, Radha, Heart of Keld has first strike.\nYou may look at the top card of your library any time.\nYou may play lands from the top of your library.\n{4}{R}{G}: Radha gets +X/+X until end of turn, where X is the number of lands you control.",
        colors: ["red", "green"],
        supertypes: ["Legendary"],
        types: ["Creature"],
        subtypes: ["Elf", "Warrior"],
        power: "3",
        toughness: "3",
        keywords: [],
        abilities: [
            {
                id: "radha_first_strike",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                condition: 'IS_YOUR_TURN',
                effects: [
                    {
                        type: EffectType.ApplyContinuousEffect,
                        layer: 6,
                        abilitiesToAdd: ["First Strike"],
                        targetMapping: 'SELF'
                    }
                ]
            },
            {
                id: "radha_look_at_top",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [
                    {
                        type: EffectType.AllowLookAtTop,
                        targetMapping: 'CONTROLLER'
                    }
                ]
            },
            {
                id: "radha_play_lands_from_top",
                type: AbilityType.Static,
                activeZone: ZoneRequirement.Battlefield,
                effects: [
                    {
                        type: EffectType.AllowPlayFromTop,
                        restrictions: ['Land'],
                        targetMapping: 'CONTROLLER'
                    }
                ]
            },
            {
                id: "radha_activated_buff",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [
                    { type: 'Mana', value: '{4}{R}{G}' }
                ],
                effects: [
                    {
                        type: EffectType.ApplyContinuousEffect,
                        layer: 7,
                        duration: { type: DurationType.UntilEndOfTurn },
                        powerModifier: 'COUNT_Land',
                        toughnessModifier: 'COUNT_Land',
                        targetMapping: 'SELF'
                    }
                ]
            }
        ]
    }
};
