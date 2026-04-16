import { AbilityType, CardDefinition, EffectType, TargetMapping, TriggerEvent, Zone } from '@shared/engine_types';
 
 export const ForumNecroscribe: CardDefinition = {
     "name": "Forum Necroscribe",
     "manaCost": "{5}{B}",
     "colors": [
         "B"
     ],
     "types": [
         "Creature"
     ],
     "subtypes": [
         "Troll",
         "Warlock"
     ],
     "oracleText": "Ward—Discard a card.\nRepartee — Whenever you cast an instant or sorcery spell that targets a creature, return target creature card from your graveyard to the battlefield.",
     "keywords": ["Ward—Discard a card"],
     "abilities": [
         {
             type: AbilityType.Triggered,
                    eventMatch: TriggerEvent.CastSpell,
             targets: [{ type: 'Card', restrictions: ['Creature', 'Graveyard', 'YouControl'] }],
             condition: 'PLAYER_IS_CONTROLLER && (EVENT_OBJECT_MATCHES:Instant || EVENT_OBJECT_MATCHES:Sorcery) && SPELL_TARGETS_CREATURE',
             effects: [
                 {
                     type: EffectType.MoveToZone,
                     zone: Zone.Battlefield,
                     targetMapping: TargetMapping.Target1
                 }
             ]
         }
     ],
     "power": "5",
     "toughness": "4"
 };




