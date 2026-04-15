import { CardDefinition, AbilityType, EffectType, TargetMapping, Zone } from '@shared/engine_types';

export const SkycoachConductorAllAboard: CardDefinition = {
    name: "Skycoach Conductor",
    manaCost: "{2}{U}",
    colors: ["U"],
    types: ["Creature"],
    subtypes: ["Bird", "Pilot"],
    power: "2",
    toughness: "3",
    keywords: ["Flash", "Flying", "Vigilance", "Prepared"],
    oracleText: "Flash\nFlying, vigilance\nThis creature enters prepared.",
    entersPrepared: true,

    preparedFace: {
        name: "All Aboard",
        manaCost: "{U}",
        colors: ["U"],
        types: ["Instant"],
        oracleText: "Exile target non-Pilot creature you control, then return that card to the battlefield under its owner's control.",
        abilities: [
            {
                type: AbilityType.Spell,
                targetDefinition: {
                    type: 'Creature',
                    count: 1,
                    restrictions: ['YouControl', { not: { subtype: 'Pilot' } }]
                },
                effects: [
                    { type: EffectType.Exile, targetMapping: TargetMapping.Target1 },
                    { type: EffectType.MoveToZone, zone: Zone.Battlefield, targetMapping: 'LAST_EXILED_OBJECT' }
                ]
            }
        ]
    }
};
