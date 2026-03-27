import { CardDefinition } from '@shared/engine_types';

/**
 * What is an Ability?
 * In MTG, abilities are categorized mainly into:
 * 1. SpellAbility: The innate effect of Instant/Sorceries or ETB effects.
 * 2. ActivatedAbility: Cost : Effect
 * 3. TriggeredAbility: Event (When/Whenever/At) -> Condition (If) -> Effect
 * 4. StaticAbility: Continuous effects that don't go on the stack (e.g., Flying, "Creatures you control get +1/+1")
 */

export enum AbilityType {
  Spell = 'Spell',
  Activated = 'Activated',
  Triggered = 'Triggered',
  Static = 'Static'
}

export enum ZoneRequirement {
  Battlefield = 'Battlefield',
  Graveyard = 'Graveyard',
  Hand = 'Hand',
  Stack = 'Stack',
  Any = 'Any'
}

// Represents the parsed, programmatic meaning of an ability.
export interface ParsedAbility {
  id: string; // Unique for the card
  type: AbilityType;
  
  // To activate/trigger this ability, where does the card need to be? (Usually Battlefield)
  activeZone: ZoneRequirement;

  // --- For Activated Abilities ---
  // The cost block (Mana, Tap, Pay Life, Discard, Sacrifice...)
  costs?: AbilityCost[];

  // --- For Triggered Abilities ---
  // A string or enum representing the game event (e.g., 'ON_UPKEEP', 'ON_ENTER_BATTLEFIELD', 'ON_DAMAGE_DEALT')
  triggerEvent?: string; 
  // Custom logic to test if the trigger condition is fully met
  // e.g. "At the beginning of YOUR upkeep" -> requires checking if currentPlayer == controller
  triggerCondition?: any; 

  // --- Common to Spell / Activated / Triggered ---
  // Target Requirements (e.g., "Target creature or planeswalker", "Target player")
  targetDefinition?: TargetDefinition;

  // The actual sequence of effects to push onto the stack and resolve
  effects: EffectDefinition[];
}

export interface AbilityCost {
  type: 'Mana' | 'Tap' | 'PayLife' | 'Discard' | 'Sacrifice';
  value: any; // e.g. "{1}{R}" or "3" for life, or generic TargetDefinition for sacrifices
}

export interface TargetDefinition {
  type: 'Player' | 'Permanent' | 'Spell' | 'CardInGraveyard';
  count: number;
  restrictions?: string[]; // e.g., ["Opponent"], ["Creature", "cmc<=3"]
}

export interface EffectDefinition {
  type: 'DealDamage' | 'DrawCards' | 'Destroy' | 'CreateToken' | 'AddCounters' | 'ApplyContinuousEffect';
  amount?: number;
  value?: any; 
  // The target of the effect. Can be "Target", "Ourselves", "AllOpponents", etc.
  targetMapping: string; 
}

// Extends the base CardDefinition array with programmatic abilities instead of just text
export interface ImplementableCard extends CardDefinition {
  abilities: ParsedAbility[];
}

// Example representation of a classic card: Lightning Bolt
export const LightningBoltDefinition: ImplementableCard = {
  name: "Lightning Bolt",
  manaCost: "{R}",
  colors: ["R"],
  supertypes: [],
  types: ["Instant"],
  subtypes: [],
  oracleText: "Lightning Bolt deals 3 damage to any target.",
  
  abilities: [
    {
      id: "spell_effect",
      type: AbilityType.Spell,
      activeZone: ZoneRequirement.Stack,
      targetDefinition: {
        type: 'Permanent', // In a full implementation, "Any Target" = 'Creature' | 'Planeswalker' | 'Player'
        count: 1
      },
      effects: [
        {
          type: 'DealDamage',
          amount: 3,
          targetMapping: 'Target_1'
        }
      ]
    }
  ]
};

// Example representation of: Llanowar Elves
export const LlanowarElvesDefinition: ImplementableCard = {
  name: "Llanowar Elves",
  manaCost: "{G}",
  colors: ["G"],
  supertypes: [],
  types: ["Creature"],
  subtypes: ["Elf", "Druid"],
  power: "1",
  toughness: "1",
  oracleText: "{T}: Add {G}.",
  
  abilities: [
    {
      id: "mana_ability_1",
      type: AbilityType.Activated,
      activeZone: ZoneRequirement.Battlefield,
      costs: [
        { type: 'Tap', value: true }
      ],
      effects: [
        {
          type: 'ApplyContinuousEffect', // More likely a specialized 'AddMana' effect
          value: { G: 1 },
          targetMapping: 'Controller'
        }
      ]
    }
  ]
};
