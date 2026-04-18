import { AbilityType, CardDefinition, EffectType, Restriction, TargetMapping, TargetType, TriggerEvent, Zone } from '@shared/engine_types';
export const PrimaryResearch: CardDefinition = {
  name: "Primary Research",
  manaCost: "{4}{W}",
    scryfall_id: "f6fdb814-45c6-4d14-afff-7f5bd1bd10a1",
    rarity: "uncommon",
    image_url: "https://cards.scryfall.io/normal/front/f/6/f6fdb814-45c6-4d14-afff-7f5bd1bd10a1.jpg?1775937094",
  colors: ["W"],
  types: ["Enchantment"],
  subtypes: [],
  keywords: [],
  oracleText: "When this enchantment enters, return target nonland permanent card with mana value 3 or less from your graveyard to the battlefield.\nAt the beginning of your end step, if a card left your graveyard this turn, draw a card.",
  abilities: [
    {
      type: AbilityType.Triggered,
      eventMatch: TriggerEvent.EnterBattlefield,
      targetDefinition: {
        type: TargetType.CardInGraveyard,
        restrictions: [
          Restriction.NonLand,
          Restriction.Permanent,
          "mv <= 3",
          Restriction.YouControl
        ],
        count: 1
      },
      effects: [
        {
          type: EffectType.MoveToZone,
          zone: Zone.Battlefield,
          targetMapping: TargetMapping.Target1
        }
      ]
    },
    {
      type: AbilityType.Triggered,
      eventMatch: TriggerEvent.EndStep,
      condition: 'IS_YOUR_TURN && CARDS_LEFT_YOUR_GRAVEYARD_THIS_TURN',
      effects: [
        {
          type: EffectType.DrawCards,
          amount: 1
        }
      ]
    }
  ]
};

