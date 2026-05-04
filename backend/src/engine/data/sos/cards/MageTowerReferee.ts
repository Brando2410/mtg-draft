import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';
import { RuleUtils } from '../../../utils/RuleUtils';

export const MageTowerReferee: CardDefinition = {
    name: "Mage Tower Referee",
    manaCost: "{2}",
    scryfall_id: "1ceb704a-97a8-49f9-b799-30f001404144",
    rarity: "common",
    image_url: "https://cards.scryfall.io/normal/front/1/c/1ceb704a-97a8-49f9-b799-30f001404144.jpg?1775938737",
    colors: [],
    types: ["Artifact", "Creature"],
    subtypes: ["Construct"],
    power: "2",
    toughness: "1",
    keywords: [],
    oracleText: "Whenever you cast a multicolored spell, put a +1/+1 counter on this creature.",
    abilities: [
        {
            type: AbilityType.Triggered,
            eventMatch: TriggerEvent.CastSpell,
            condition: (state, event, ability) => {
                if (event.playerId !== ability.controllerId) return false;
                const card = RuleUtils.getEventObject(event, state);
                if (!card) return false;
                const uniqueColors = new Set(card.definition.colors || []);
                return uniqueColors.size >= 2;
            },
            effects: [
                {
                    type: EffectType.AddCounters,
                    counterType: '+1/+1',
                    amount: 1,
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ]
};
