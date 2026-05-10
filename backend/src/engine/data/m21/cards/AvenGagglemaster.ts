import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const AvenGagglemaster: CardDefinition = {
    name: "Aven Gagglemaster",
    manaCost: "{3}{W}{W}",

    oracleText: "Flying\nWhen this creature enters, you gain 2 life for each creature you control with flying.",
    colors: ["W"],
    types: ["Creature"],
    subtypes: ["Bird", "Warrior"],
    power: "4",
    toughness: "3",
    keywords: ["Flying"],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
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
    ],
    scryfall_id: "c5b57247-81cc-44ec-b5a9-0702111a98a8",
    image_url: "https://cards.scryfall.io/normal/front/c/5/c5b57247-81cc-44ec-b5a9-0702111a98a8.jpg?1594734738",
    rarity: "uncommon"
};

