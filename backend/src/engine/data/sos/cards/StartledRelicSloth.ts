import { AbilityType, CardDefinition, ConditionType, EffectType, TargetType, TriggerEvent } from '@shared/engine_types';
export const StartledRelicSloth: CardDefinition = {
    name: "Startled Relic Sloth",
    manaCost: "{2}{R}{W}",
    colors: ["R", "W"],
    types: ["Creature"],
    subtypes: ["Sloth", "Beast"],
    keywords: ["Trample", "Lifelink"],
    power: "4",
    toughness: "4",
    oracleText: "Trample, lifelink\nAt the beginning of combat on your turn, exile up to one target card from a graveyard.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.BeginningOfCombatStep,
            condition: ConditionType.IsYourTurn,
            effects: [
                {
                    type: EffectType.Exile,
                    targetDefinitions: [{
                        type: TargetType.CardInGraveyard,
                        count: 1,
                        minCount: 0,
                        optional: true,
                        label: "Select up to one card to exile"
                    }]
                }
            ]
        }
    ],
    scryfall_id: "f143fd41-58c3-45a0-bef8-e9e4b4a502a5",
    image_url: "https://cards.scryfall.io/normal/front/f/1/f143fd41-58c3-45a0-bef8-e9e4b4a502a5.jpg?1775938628",
    rarity: "uncommon"
};

