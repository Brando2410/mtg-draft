import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';

export const AvenGagglemaster: CardDefinition = {

    name: "Aven Gagglemaster",
    manaCost: "{3}{W}{W}",
    oracleText: "Flying\nWhen this creature enters, you gain 2 life for each creature you control with flying.",
    colors: ["W"],
    supertypes: [],
    types: ["Creature"],
    subtypes: ["Bird", "Warrior"],
    power: "4",
    toughness: "3",
    keywords: ["Flying"],
    abilities: [
        {
            id: "aven_gagglemaster_etb",
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            activeZone: Zone.Battlefield,
            condition: (state: any, event: any, source: any) => event.data?.object?.id === source.sourceId,
            effects: [{
                type: EffectType.GainLife,
                amount: (state: any, source: any) => {
                    const count = state.battlefield.filter((o: any) =>
                        o.controllerId === source.controllerId &&
                        ((o.definition.keywords || []).some((k: string) => k.toLowerCase() === "flying") ||
                            (o.effectiveStats?.abilitiesToAdd || []).some((k: string) => k.toLowerCase() === "flying"))
                    ).length;
                    return 2 * count;
                },
                targetMapping: TargetMapping.Controller
            }]
        }
    ]

};



