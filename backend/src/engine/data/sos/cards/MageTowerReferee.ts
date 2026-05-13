import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TriggerEvent } from '@shared/engine_types';

export const MageTowerReferee: CardDefinition = {
    name: "Mage Tower Referee",
    manaCost: "{2}",


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
            condition: `${ConditionType.EventPlayerIsYou} && ${ConditionType.SpellIsMulticolored}`,
            effects: [
                {
                    type: EffectType.AddCounters,
                    counterType: '+1/+1',
                    amount: 1,
                    targetMapping: TargetMapping.Self
                }
            ]
        }
    ],
    scryfall_id: "1ceb704a-97a8-49f9-b799-30f001404144",
    image_url: "https://cards.scryfall.io/normal/front/1/c/1ceb704a-97a8-49f9-b799-30f001404144.jpg?1775938737",
    rarity: "common"
};

