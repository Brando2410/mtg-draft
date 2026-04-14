import { CardDefinition, AbilityType, EffectType, Zone } from '@shared/engine_types';
 
 export const FlowState: CardDefinition = {
     "name": "Flow State",
     "manaCost": "{1}{U}",
     "colors": [
         "U"
     ],
     "types": [
         "Sorcery"
     ],
     "subtypes": [],
     "oracleText": "Look at the top three cards of your library. Put one of them into your hand and the rest on the bottom of your library in any order. If there is an instant card and a sorcery card in your graveyard, instead put two of them into your hand and the rest on the bottom of your library in any order.",
     "abilities": [
         {
             type: AbilityType.Spell,
             effects: [
                 {
                     type: EffectType.ConditionalEffect,
                     effects: [
                         {
                             condition: 'HAS_INSTANT_AND_SORCERY_IN_GY',
                             type: EffectType.LookAtTopAndPick,
                             fromTop: 3,
                             amount: 2,
                             destination: Zone.Hand,
                             remainderZone: Zone.Library,
                             remainderPosition: 'bottom'
                         },
                         {
                             condition: '!HAS_INSTANT_AND_SORCERY_IN_GY',
                             type: EffectType.LookAtTopAndPick,
                             fromTop: 3,
                             amount: 1,
                             destination: Zone.Hand,
                             remainderZone: Zone.Library,
                             remainderPosition: 'bottom'
                         }
                     ]
                 }
             ]
         }
     ]
 };


