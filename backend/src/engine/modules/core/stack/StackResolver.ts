import { EffectDefinition, GameState, StackObject, Zone } from '@shared/engine_types';
import { ActionProcessor } from '../../actions/ActionProcessor';
import { TargetingProcessor } from '../../actions/targeting/TargetingProcessor';
import { EffectProcessor } from '../../effects/EffectProcessor';

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
  public resolveObject(stackObj: StackObject, effects: EffectDefinition[], startIndex: number = 0): boolean {
    if (startIndex === 0) {
      this.log(`Resolving: ${this.getObjectName(stackObj)}`);
    } else {
      this.log(`Resuming: ${this.getObjectName(stackObj)}...`);
    }

    // 0. Rule 603.4: Intervening "if" clause re-check
    if (startIndex === 0 && stackObj.condition) {
      const { ConditionProcessor } = require('../../core/logic/ConditionProcessor');
      const context = {
        sourceId: stackObj.sourceId,
        controllerId: stackObj.controllerId,
        event: stackObj.data?.event,
        stackObject: stackObj
      };
      
      if (!ConditionProcessor.matchesCondition(this.state, stackObj.condition, context)) {
        this.log(`${this.getObjectName(stackObj)} failed to resolve: condition "${stackObj.condition}" no longer met.`);
        this.fizzle(stackObj);
        return true;
      }
    }

    // 1. Re-evaluate Targets (Rule 608.2b)
    // Only on initial resolution
    if (startIndex === 0 && this.areAllTargetsIllegal(stackObj)) {
      this.log(`${this.getObjectName(stackObj)} fizzled (all targets illegal).`);
      this.fizzle(stackObj);
      return true;
    }

    // 2. Execute Effects (Rule 608.2c)
    const completed = EffectProcessor.resolveEffects({
      state: this.state,
      effects,
      sourceId: stackObj.sourceId,
      targets: stackObj.targets || [],
      log: (m: string) => this.log(m),
      startIndex,
      stackObject: stackObj
    });

    if (!completed) {
      return false; // SUSPENDED
    }

    // 3. Post-Resolution Cleanup (Rule 608.2m)
    this.postResolutionCleanup(stackObj);
    return true;
  }

  private areAllTargetsIllegal(stackObj: StackObject): boolean {
    if (!stackObj.targets || stackObj.targets.length === 0) return false;

    // A spell/ability is countered if ALL its targets are illegal.
    return stackObj.targets.every((targetId, index) => {
      return !TargetingProcessor.isLegalTarget(this.state, {
        sourceId: stackObj.sourceId,
        controllerId: stackObj.controllerId,
        stackObject: stackObj,
        targetDef: stackObj.data?.targetDefinition,
        targetIndex: index
      }, targetId);
    });
  }

  private fizzle(stackObj: StackObject) {
    this.postResolutionCleanup(stackObj, true);
  }

  private postResolutionCleanup(stackObj: StackObject, fizzled: boolean = false) {
    if (stackObj.type === 'Spell' && stackObj.card) {
      const card = stackObj.card;
      if (fizzled) {
        if (stackObj.exileOnResolution || (stackObj as any).isCopy) {
          this.log(`[RULE 701.5] ${card.definition.name} (fizzled) was exiled instead of being put into graveyard.`);
          ActionProcessor.removeFromCurrentZone(this.state, card);
          if (!(stackObj as any).isCopy) {
            ActionProcessor.moveCard(this.state, card, Zone.Exile, card.ownerId, (m: string) => this.log(m));
          }
        } else {
          ActionProcessor.moveCard(this.state, card, Zone.Graveyard, card.ownerId, (m: string) => this.log(m));
        }
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
        // Rule 303.4: Auras enter attached to their target
        const isAura = card.definition.subtypes?.some(s => s.toLowerCase() === 'aura');
        if (isAura && stackObj.targets.length > 0) {
          card.attachedTo = stackObj.targets[0];
          this.log(`${card.definition.name} enters attached to ${this.getObjectName({ id: card.attachedTo, sourceId: card.attachedTo } as any)}.`);
        }

        // Rule 110.2: Permanent enters under controller's control
        card.xValue = stackObj.xValue;
        ActionProcessor.moveCard(this.state, card, Zone.Battlefield, stackObj.controllerId, (m: string) => this.log(m));
      } else if (card.zone === Zone.Stack) {
        const { oracle } = require("../../../OracleLogicMap");
        const freshDef = oracle.getCard(card.definition.name);
        const shouldExile = stackObj.exileOnResolution || stackObj.isCopy || card.isPreparedCopy || freshDef?.exileOnResolution;

        console.log(`[RESOLVE-DEBUG] ${card.definition.name} cleanup: shouldExile=${shouldExile} (stackObj.exileOnRes=${stackObj.exileOnResolution})`);

        if (shouldExile) {
          const reason = card.isPreparedCopy ? 'Prepared spell' : (stackObj.isCopy ? 'Copy' : (freshDef?.exileOnResolution ? 'Card Definition' : 'Effect'));
          this.log(`[RULE 701.5] ${card.definition.name} (${reason}) ceases to exist after resolution.`);

          ActionProcessor.removeFromCurrentZone(this.state, card);
          if (!(stackObj.isCopy || card.isPreparedCopy)) {
            ActionProcessor.moveCard(this.state, card, Zone.Exile, card.ownerId, (m: string) => this.log(m));
          }
        } else {
          ActionProcessor.moveCard(this.state, card, Zone.Graveyard, card.ownerId, (m: string) => this.log(m));
        }
      }
    }
  }

  private getObjectName(stackObj: StackObject): string {
    if (stackObj.type === 'Spell' && stackObj.card) return stackObj.card.definition.name;
    const source = this.state.battlefield.find(o => o.id === stackObj.sourceId);
    return source ? source.definition.name : 'Ability';
  }
}

