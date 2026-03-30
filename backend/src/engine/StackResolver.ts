import { GameState, GameObjectId, PlayerId, Zone, StackObject, GameObject } from '@shared/engine_types';

type EffectDefinition = any;

export class StackResolver {
  private state: GameState;

  constructor(state: GameState) {
    this.state = state;
  }
  private log(message: string) {
    const formattedMessage = `> [Stack] ${message}`;
    const newLogs = [...(this.state.logs || []), formattedMessage];
    this.state.logs = newLogs.slice(-40);
    console.log(`[StackResolver] ${message}`);
  }

  /**
   * Called by the GameEngine when all players pass priority sequentially.
   * Resolves the top-most object on the stack.
   */
  public resolveTarget(stackObj: StackObject, effects: EffectDefinition[]) {
    this.log(`Resolving stack object: ${stackObj.id}`);
    
    // 1. Re-evaluate Targets (Rule 608.2b)
    // If all targets are illegal, fizzle.
    if (this.areAllTargetsIllegal(stackObj)) {
      this.log(`Spell/Ability fizzled due to illegal targets.`);
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
    const { ValidationProcessor } = require('./modules/state/ValidationProcessor');

    // Rule 608.2b: Check if the target is still legal (e.g. hasn't Phased Out, been destroyed, or gained Hexproof)
    return ValidationProcessor.isLegalTarget(
        this.state, 
        stackObj.sourceId, 
        targetId, 
        stackObj.data?.targetDefinition
    );
  }

  private applyEffect(stackObj: StackObject, effect: EffectDefinition) {
    const { EffectProcessor } = require('./modules/effects/EffectProcessor');
    EffectProcessor.executeEffect(
        this.state, 
        effect, 
        stackObj.sourceId, 
        stackObj.targets, 
        (m: string) => this.log(m)
    );
  }

  // Maps logical targets ('Target_1', 'Controller', 'AllOpponents') to concrete IDs array
  private resolveTargetMapping(stackObj: StackObject, mapping: string): string[] {
    const upMapping = mapping.toUpperCase();

    if (upMapping === 'CONTROLLER') {
      return [stackObj.controllerId];
    }
    if (upMapping === 'SELF') {
      return [stackObj.sourceId];
    }
    if (upMapping === 'TARGET_ALL') {
      return stackObj.targets;
    }
    if (upMapping.startsWith('TARGET_')) {
      // e.g., 'TARGET_1' or 'Target_1' -> stackObj.targets[0]
      const indexStr = upMapping.split('_')[1];
      if (indexStr === 'ALL') return stackObj.targets;
      const index = parseInt(indexStr, 10) - 1;
      return stackObj.targets[index] ? [stackObj.targets[index]] : [];
    }
    if (upMapping === 'ALLOPPONENTS') {
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
    if (stackObj.type === 'Spell' && stackObj.card) {
      const card = stackObj.card;
      const player = this.state.players[card.ownerId];
      if (!player) return;

      if (fizzled) {
        // Rule 601: Fizzled spells go to graveyard
        card.zone = Zone.Graveyard;
        player.graveyard.push(card);
        console.log(`[StackResolver] Fizzled spell ${card.definition.name} moved to GY.`);
        return;
      }

      // Rule 400.1 / Chapter 6: Non-permanents go to GY, Permanents go to Battlefield
      const typeLine = (card.definition.type_line || '').toLowerCase();
      const isPermanent = typeLine.includes('creature') || 
                          typeLine.includes('artifact') || 
                          typeLine.includes('enchantment') || 
                          typeLine.includes('planeswalker') || 
                          typeLine.includes('battle');

      if (isPermanent) {
        const { ActionProcessor } = require('./modules/actions/ActionProcessor');
        ActionProcessor.moveCard(this.state, card, Zone.Battlefield, card.ownerId, (m: string) => this.log(m));
      } else {
        // Instant/Sorcery (Rule 608.2m)
        card.zone = Zone.Graveyard;
        player.graveyard = [...player.graveyard, card]; // Immutable
        this.log(`${card.definition.name} resolved and moved to GY.`);
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
