import { CardDefinition, AbilityType, EffectType, TargetMapping } from '@shared/engine_types';
 
 export const FoolishFate: CardDefinition = {
     "name": "Foolish Fate",
     "manaCost": "{2}{B}",
     "colors": [
         "B"
     ],
     "types": [
         "Instant"
     ],
     "subtypes": [],
     "oracleText": "Destroy target creature.\nInfusion — If you gained life this turn, that creature's controller loses 3 life.",
     "abilities": [
         {
             type: AbilityType.Spell,
             targetDefinition: { type: 'Creature' },
             effects: [
                 {
                     type: EffectType.Destroy,
                     targetMapping: TargetMapping.Target1
                 },
                 {
                     condition: 'INFUSION',
                     type: EffectType.LoseLife,
                     amount: 3,
                     targetMapping: TargetMapping.Target1Controller
                 }
             ]
         }
     ]
 };


