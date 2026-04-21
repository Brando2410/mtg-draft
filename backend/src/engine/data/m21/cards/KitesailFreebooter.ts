import { AbilityType, CardDefinition, DurationType, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent } from '@shared/engine_types';

export const KitesailFreebooter: CardDefinition = {
    name: "Kitesail Freebooter",
    manaCost: "{1}{B}",
    scryfall_id: "77cd2814-57c7-44a8-9533-03f4c5eb5924",
    image_url: "https://cards.scryfall.io/normal/front/7/7/77cd2814-57c7-44a8-9533-03f4c5eb5924.jpg?1594736139",
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
            targetDefinition: { type: TargetType.Opponent, count: 1 },
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
    ]
};
