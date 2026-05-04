import { AbilityType, CardDefinition, ConditionType, EffectType, TargetMapping, TargetType } from '@shared/engine_types';

export const FoolishFate: CardDefinition = {
    name: "Foolish Fate",
    manaCost: "{2}{B}",
    scryfall_id: "d278f4c9-d20b-4a76-8c5c-4d3e985948b9",
    rarity: "uncommon",
    image_url: "https://cards.scryfall.io/normal/front/d/2/d278f4c9-d20b-4a76-8c5c-4d3e985948b9.jpg?1775937489",
    colors: [
         "B"
     ],
    types: [
         "Instant"
     ],
    subtypes: [],
    keywords: [],
    oracleText: "Destroy target creature.\nInfusion — If you gained life this turn, that creature's controller loses 3 life.",
    abilities: [
         {
             type: AbilityType.Spell,
             targetDefinitions: [{ type: TargetType.Creature }],
             effects: [
                 {
                     type: EffectType.Destroy,
                     targetMapping: TargetMapping.Target1
                 },
                 {
                     condition: ConditionType.Infusion,
                     type: EffectType.LoseLife,
                     amount: 3,
                     targetMapping: TargetMapping.Target1Controller
                 }
             ]
         }
     ]
 };
