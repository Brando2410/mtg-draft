import { AbilityType, CardDefinition, DurationType, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const KitesailFreebooter: CardDefinition = {
    name: "Kitesail Freebooter",
    manaCost: "{1}{B}",
    oracleText: "Flying\nWhen Kitesail Freebooter enters the battlefield, target opponent reveals their hand. You choose a noncreature, nonland card from it. Exile that card until Kitesail Freebooter leaves the battlefield.",
    colors: ["B"],
    types: ["Creature"],
    subtypes: ["Human", "Pirate"],
    power: "1",
    toughness: "2",
    keywords: ["Flying"],
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.EnterBattlefield,
            targetDefinitions: [{ type: TargetType.Opponent, count: 1 }],
            effects: [
                {
                    type: EffectType.Choice,
                    label: "Choose a noncreature, nonland card from opponent's hand to exile",
                    selectionPool: TargetMapping.Target1HandRevealPick,
                    restrictions: [Restriction.NonCreature, Restriction.NonLand],
                    effects: [
                        {
                            type: EffectType.Exile,
                            duration: { type: DurationType.UntilSourceLeavesBattlefield },
                            targetMapping: TargetMapping.Target1
                        }
                    ]
                }
            ]
        }
    ],
    scryfall_id: "88496096-fd9a-451a-85d9-31ccc3580623",
    image_url: "https://cards.scryfall.io/normal/front/8/8/88496096-fd9a-451a-85d9-31ccc3580623.jpg?1594736212",
    rarity: "uncommon"
};

