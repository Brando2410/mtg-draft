import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const LeafkinAvenger: Record<string, ImplementableCard> = {
    "Leafkin Avenger": {
        name: "Leafkin Avenger",
        manaCost: "{2}{R}{G}",
        oracleText: "{T}: Add {G} for each creature with power 4 or greater you control.\n{7}{R}: This creature deals damage equal to its power to target player or planeswalker.",
        colors: ["green", "red"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Elemental", "Druid"],
        power: "4",
        toughness: "3",
        keywords: [],
        abilities: [
            {
                id: "leafkin_avenger_mana",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Tap', value: null }],
                isManaAbility: true,
                effects: [{
                    type: EffectType.AddMana,
                    value: 'G',
                    amount: (state: any, source: any) => {
                        return state.battlefield.filter((o: any) =>
                            o.controllerId === source.controllerId &&
                            o.definition.types.some((t: any) => t.toLowerCase() === 'creature') &&
                            (o.effectiveStats?.power ?? 0) >= 4
                        ).length;
                    },
                    targetMapping: 'CONTROLLER'
                }]
            },
            {
                id: "leafkin_avenger_ping",
                type: AbilityType.Activated,
                activeZone: ZoneRequirement.Battlefield,
                costs: [{ type: 'Mana', value: '{7}{R}' }],
                targetDefinition: { type: 'AnyTarget', count: 1, restrictions: ['Player', 'Planeswalker'] },
                effects: [{
                    type: EffectType.DealDamage,
                    amount: 'POWER',
                    targetMapping: 'TARGET_1'
                }]
            }
        ]
    }
};
