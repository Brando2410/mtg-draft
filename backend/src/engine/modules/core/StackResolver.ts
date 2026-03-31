import { GameState, GameObjectId, PlayerId, Zone, StackObject, GameObject, EffectDefinition } from '@shared/engine_types';
import { ActionProcessor } from '../actions/ActionProcessor';
import { EffectProcessor } from '../effects/EffectProcessor';
import { ValidationProcessor } from '../state/ValidationProcessor';

/**
 * Rules Engine Module: Stack Resolution (Rule 608)
 * Handles the logic of re-evaluating targets and executing effects when 
 * objects on the stack resolve.
 */
export class StackResolver {
  private state: GameState;

  constructor(state: GameState) {
    this.state = state;
  }

  private log(message: string) {
    const formattedMessage = `> [Stack] ${message}`;
    const newLogs = [...(this.state.logs || []), formattedMessage];
    this.state.logs = newLogs.slice(-40);
  }

  /**
   * CR 608.2: Resolving a Spell or Ability
   * This is called by the GameEngine when all players pass priority sequentially.
   */
  public resolveObject(stackObj: StackObject, effects: EffectDefinition[]) {
    this.log(`Resolving: ${this.getObjectName(stackObj)}`);
    
    // 1. Re-evaluate Targets (Rule 608.2b)
    // If all targets are illegal, the spell/ability is removed from the stack and fizzles.
    if (this.areAllTargetsIllegal(stackObj)) {
      this.log(`${this.getObjectName(stackObj)} fizzled (all targets illegal).`);
      this.fizzle(stackObj);
      return;
    }
    
    // 2. Execute Effects (Rule 608.2c)
    // Even if some targets are illegal, others might still be affected.
    EffectProcessor.resolveEffects(
        this.state, 
        effects, 
        stackObj.sourceId, 
        stackObj.targets, 
        (m: string) => this.log(m)
    );
    
    // 3. Post-Resolution Cleanup (Rule 608.2m)
    this.postResolutionCleanup(stackObj);
  }

  private areAllTargetsIllegal(stackObj: StackObject): boolean {
    if (!stackObj.targets || stackObj.targets.length === 0) return false;

    // A spell/ability is countered if ALL its targets are illegal.
    return stackObj.targets.every(targetId => {
        return !ValidationProcessor.isLegalTarget(
            this.state, 
            stackObj.sourceId, 
            targetId, 
            stackObj.data?.targetDefinition
        );
    });
  }

  private fizzle(stackObj: StackObject) {
    this.postResolutionCleanup(stackObj, true);
  }

  private postResolutionCleanup(stackObj: StackObject, fizzled: boolean = false) {
    if (stackObj.type === 'Spell' && stackObj.card) {
      const card = stackObj.card;
      if (fizzled) {
        ActionProcessor.moveCard(this.state, card, Zone.Graveyard, card.ownerId, (m: string) => this.log(m));
        return;
      }

      // Rule 608.2m: As the final step of resolution, the spell is put into its owner's graveyard.
      // If it's a permanent spell, it enters the battlefield instead.
      const types = card.definition.types.map(t => t.toLowerCase());
      const isPermanent = types.includes('creature') || 
                          types.includes('artifact') || 
                          types.includes('enchantment') || 
                          types.includes('planeswalker') || 
                          types.includes('land');

      if (isPermanent) {
        ActionProcessor.moveCard(this.state, card, Zone.Battlefield, card.ownerId, (m: string) => this.log(m));
      } else {
        ActionProcessor.moveCard(this.state, card, Zone.Graveyard, card.ownerId, (m: string) => this.log(m));
      }
    }
  }

  private getObjectName(stackObj: StackObject): string {
      if (stackObj.type === 'Spell' && stackObj.card) return stackObj.card.definition.name;
      const source = this.state.battlefield.find(o => o.id === stackObj.sourceId);
      return source ? source.definition.name : 'Ability';
  }
}
