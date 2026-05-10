import { AbilityType, CardDefinition, ConditionType, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';
export const PrimaryResearch: CardDefinition = {
  name: "Primary Research",
  manaCost: "{4}{W}",


  colors: ["W"],
  types: ["Enchantment"],
  subtypes: [],
  keywords: [],
  oracleText: "When this enchantment enters, return target nonland permanent card with mana value 3 or less from your graveyard to the battlefield.\nAt the beginning of your end step, if a card left your graveyard this turn, draw a card.",
  abilities: [
    {
      type: AbilityType.Triggered,
      eventMatch: TriggerEvent.EnterBattlefield,

      effects: [
        {
          type: EffectType.MoveToZone,
          zone: Zone.Battlefield,
          targetDefinitions: [{
            type: TargetType.CardInGraveyard,
            restrictions: [
              Restriction.NonLand,
              Restriction.Permanent,
              Restriction.ManaValue3OrLess,
              Restriction.YouOwn
            ],
            minCount: 0,
            maxCount: 1
          }]
        }
      ]
    },
    {
      type: AbilityType.Triggered,
      eventMatch: TriggerEvent.EndStep,
      condition: `${ConditionType.IsYourTurn} && ${ConditionType.CardsLeftYourGraveyardThisTurn}`,
      effects: [
        {
          type: EffectType.DrawCards,
          amount: 1
        }
      ]
    }
  ],
    scryfall_id: "f6fdb814-45c6-4d14-afff-7f5bd1bd10a1",
    image_url: "https://cards.scryfall.io/normal/front/f/6/f6fdb814-45c6-4d14-afff-7f5bd1bd10a1.jpg?1775937094",
    rarity: "uncommon"
};

