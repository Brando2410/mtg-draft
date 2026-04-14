import { CardDefinition, AbilityType, EffectType, Zone } from '@shared/engine_types';
 
 export const FollowtheLumarets: CardDefinition = {
     "name": "Follow the Lumarets",
     "manaCost": "{1}{G}",
     "colors": [
         "G"
     ],
     "types": [
         "Sorcery"
     ],
     "subtypes": [],
     "oracleText": "Infusion — Look at the top four cards of your library. You may reveal a creature or land card from among them and put it into your hand. If you gained life this turn, you may instead reveal two creature and/or land cards from among them and put them into your hand. Put the rest on the bottom of your library in a random order.",
     "abilities": [
         {
             type: AbilityType.Spell,
             effects: [
                 {
                     type: EffectType.ConditionalEffect,
                     effects: [
                         {
                             condition: 'INFUSION',
                             type: EffectType.LookAtTopAndPick,
                             fromTop: 4,
                             amount: 2,
                             restrictions: ['Creature', 'Land'],
                             reveal: true,
                             optional: true,
                             destination: Zone.Hand,
                             remainderZone: Zone.Library,
                             remainderPosition: 'bottom',
                             shuffleRemainder: true
                         },
                         {
                             condition: '!INFUSION',
                             type: EffectType.LookAtTopAndPick,
                             fromTop: 4,
                             amount: 1,
                             restrictions: ['Creature', 'Land'],
                             reveal: true,
                             optional: true,
                             destination: Zone.Hand,
                             remainderZone: Zone.Library,
                             remainderPosition: 'bottom',
                             shuffleRemainder: true
                         }
                     ]
                 }
             ]
         }
     ]
 };


