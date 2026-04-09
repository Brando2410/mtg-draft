import { AbilityType, ZoneRequirement, ImplementableCard, Zone, EffectType, GameEvent, GameObject, TargetType } from '@shared/engine_types';

export const AvenGagglemaster: Record<string, ImplementableCard> = {
    "Aven Gagglemaster": {
        name: "Aven Gagglemaster",
        manaCost: "{3}{W}{W}",
        oracleText: "Flying\nWhen this creature enters, you gain 2 life for each creature you control with flying.",
        colors: ["white"],
        supertypes: [],
        types: ["Creature"],
        subtypes: ["Bird","Warrior"],
        power: "4",
        toughness: "3",
        keywords: ["Flying"],
        abilities: [
            {
                id: "aven_gagglemaster_etb",
                type: AbilityType.Triggered,
                triggerEvent: 'ON_ETB',
                activeZone: ZoneRequirement.Battlefield,
                triggerCondition: (state: any, event: any, source: any) => event.data?.object?.id === source.sourceId,
                effects: [{
                    type: 'GainLife',
                    amount: (state: any, source: any) => {
                        const count = state.battlefield.filter((o: any) =>
                            o.controllerId === source.controllerId &&
                            ((o.definition.keywords || []).some((k: string) => k.toLowerCase() === "flying") ||
                                (o.effectiveStats?.abilitiesToAdd || []).some((k: string) => k.toLowerCase() === "flying"))
                        ).length;
                        return 2 * count;
                    },
                    targetMapping: 'CONTROLLER'
                }]
            }
        ]
    }
};
