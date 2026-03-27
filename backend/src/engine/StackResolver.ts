import { GameState, GameObjectId, PlayerId, Zone, StackObject, GameObject } from '@shared/engine_types';
import { EffectDefinition } from './CardParser';

export class StackResolver {
  private state: GameState;

  constructor(state: GameState) {
    this.state = state;
  }

  /**
   * Called by the GameEngine when all players pass priority sequentially.
   * Resolves the top-most object on the stack.
   */
  public resolveTarget(stackObj: StackObject, effects: EffectDefinition[]) {
    console.log(`[StackResolver] Resolving object: ${stackObj.id} (Source: ${stackObj.sourceId})`);
    
    // 1. Re-evaluate Targets (Rule 608.2b)
    // If all targets are illegal, fizzle.
    if (this.areAllTargetsIllegal(stackObj)) {
      console.log(`[StackResolver] Spell/Ability ${stackObj.id} fizzled due to illegal targets.`);
      this.fizzle(stackObj);
      return;
    }
    
    // 2. Perform Effects sequentially
    for (const effect of effects) {
      this.applyEffect(stackObj, effect);
    }
    
    // 3. Cleanup Spell (e.g., move Instant/Sorcery to graveyard)
    this.postResolutionCleanup(stackObj);
  }

  private areAllTargetsIllegal(stackObj: StackObject): boolean {
    if (!stackObj.targets || stackObj.targets.length === 0) {
      // If it doesn't target anything, it can't fizzle from illegal targets.
      return false;
    }

    let atLeastOneValid = false;
    
    for (const targetId of stackObj.targets) {
      // In a real implementation: Check if targetId is still in the expected zone
      // and doesn't have Shroud/Hexproof against this specific source.
      const isValid = this.isTargetValid(targetId, stackObj);
      if (isValid) {
        atLeastOneValid = true;
      }
    }
    
    // If none are valid, it fizzles
    return !atLeastOneValid;
  }

  private isTargetValid(targetId: string, stackObj: StackObject): boolean {
    // Stub implementation: Assuming target is always valid for now
    // Future: 
    // const target = this.findObject(targetId);
    // return target.zone === expectedZone && !hasHexproof(target);
    return true; 
  }

  private applyEffect(stackObj: StackObject, effect: EffectDefinition) {
    console.log(`[StackResolver] Applying effect: ${effect.type} -> ${effect.targetMapping}`);

    // Map the effect's "targetMapping" to actual real targets
    const resolvedTargets = this.resolveTargetMapping(stackObj, effect.targetMapping);

    switch (effect.type) {
      case 'DealDamage':
        // Deal N damage to each valid target
        for (const target of resolvedTargets) {
          this.dealDamage(target, effect.amount || 0);
        }
        break;

      case 'DrawCards':
        for (const target of resolvedTargets) {
          if (this.isPlayer(target)) {
            this.drawCards(target as PlayerId, effect.amount || 1);
          }
        }
        break;

      case 'Destroy':
        for (const target of resolvedTargets) {
          if (!this.isPlayer(target)) {
            this.destroyPermanent(target as GameObjectId);
          }
        }
        break;

      case 'ApplyContinuousEffect':
        // Handle adding temporary/permanent modifiers like +1/+1 until end of turn, or adding mana.
        // E.g. Add Mana logic => Llanowar Elves
        if (effect.value && typeof effect.value === 'object') {
           // Basic proxy for adding mana
           for (const target of resolvedTargets) {
             if (this.isPlayer(target)) {
               this.addMana(target as PlayerId, effect.value);
             }
           }
        }
        break;

      default:
        console.warn(`[StackResolver] Unknown effect type: ${effect.type}`);
    }
  }

  // Maps logical targets ('Target_1', 'Controller', 'AllOpponents') to concrete IDs array
  private resolveTargetMapping(stackObj: StackObject, mapping: string): string[] {
    if (mapping === 'Controller') {
      return [stackObj.controllerId];
    }
    if (mapping.startsWith('Target_')) {
      // e.g., 'Target_1' -> stackObj.targets[0]
      const index = parseInt(mapping.split('_')[1], 10) - 1;
      return stackObj.targets[index] ? [stackObj.targets[index]] : [];
    }
    if (mapping === 'AllOpponents') {
      return Object.keys(this.state.players).filter(id => id !== stackObj.controllerId);
    }
    
    return [];
  }

  // --- Concrete Effect Executions ---

  private dealDamage(targetId: string, amount: number) {
    if (this.isPlayer(targetId)) {
      const player = this.state.players[targetId as PlayerId];
      if (player) {
        player.life -= amount;
        console.log(`[StackResolver] Player ${player.id} takes ${amount} damage. Life is now ${player.life}.`);
      }
    } else {
      // Find permanent on battlefield
      const permanent = this.state.battlefield.find((p: GameObject) => p.id === targetId);
      if (permanent) {
        permanent.damageMarked += amount;
        console.log(`[StackResolver] Permanent ${permanent.id} takes ${amount} damage.`);
      }
    }
  }

  private drawCards(playerId: PlayerId, amount: number) {
    const player = this.state.players[playerId];
    if (!player) return;
    
    for (let i = 0; i < amount; i++) {
        // Implementation logic:
        // if (player.library.length === 0) { 
        //    SBA player loses game check will catch this later (704.5b)
        // }
        // const card = player.library.pop();
        // player.hand.push(card);
    }
    console.log(`[StackResolver] Player ${playerId} draws ${amount} cards.`);
  }

  private destroyPermanent(permanentId: GameObjectId) {
    const index = this.state.battlefield.findIndex((p: GameObject) => p.id === permanentId);
    if (index !== -1) {
       const permanent = this.state.battlefield[index];
       // Rule 704.5 - Move it to the Graveyard
       permanent.zone = Zone.Graveyard;
       this.state.battlefield.splice(index, 1);
       this.state.players[permanent.ownerId].graveyard.push(permanent);
       console.log(`[StackResolver] Permanent ${permanentId} was destroyed and moved to GY.`);
    }
  }

  private addMana(playerId: PlayerId, manaMap: any) {
    const player = this.state.players[playerId];
    if (player) {
      for (const [color, amount] of Object.entries(manaMap)) {
         if (player.manaPool[color as keyof typeof player.manaPool] !== undefined) {
            player.manaPool[color as keyof typeof player.manaPool] += (amount as number);
         }
      }
      console.log(`[StackResolver] Added mana to Player ${playerId}:`, manaMap);
    }
  }

  // --- Utilities ---

  private fizzle(stackObj: StackObject) {
    // A spell or ability that is countered or fizzles yields no effects.
    this.postResolutionCleanup(stackObj, true);
  }

  private postResolutionCleanup(stackObj: StackObject, fizzled: boolean = false) {
    if (stackObj.type === 'Spell') {
        const sourceObject = this.findObjectInZone(stackObj.sourceId, Zone.Stack);
        if (sourceObject) {
            // Usually put Instant/Sorcery into graveyard. Or if it's a Permanent Spell, it goes to Battlefield.
            // For now, this is a placeholder.
            console.log(`[StackResolver] Cleanup source object ${stackObj.sourceId}.`);
        }
    }
  }

  private isPlayer(id: string): boolean {
    return !!this.state.players[id as PlayerId];
  }

  private findObjectInZone(id: string, zone: Zone): any {
     // Search helper
     return null;
  }
}
