import { EffectDefinition, GameState, StackObject, Zone } from '@shared/engine_types';
import { ActionProcessor } from '../../actions/ActionProcessor';
import { TargetingProcessor } from '../../actions/targeting/TargetingProcessor';
import { EffectProcessor } from '../../effects/EffectProcessor';
import { LogCategory, EngineLogger } from '../../../utils/EngineLogger';
import { oracle } from '../../../OracleLogicMap';
import { RuleUtils } from '../../../utils/RuleUtils';
import { getProcessors } from '../../ProcessorRegistry';

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
    EngineLogger.info(this.state, LogCategory.ACTION, `[Stack] ${message}`);
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
      const { condition: ConditionProcessor } = getProcessors(this.state);
      const context = {
        sourceId: stackObj.sourceId,
        controllerId: stackObj.controllerId,
        event: stackObj.data?.event,
        stackObject: stackObj,
        targets: stackObj.targets || []
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
    this.log(`[RESOLVE] ${this.getObjectName(stackObj)} resolving. Targets: ${stackObj.targets?.join(', ')}`);
    const completed = EffectProcessor.resolveEffects({
      state: this.state,
      effects,
      sourceId: stackObj.sourceId,
      targets: stackObj.targets || [],
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

    const definitions = stackObj.targetDefinitions || stackObj.data?.targetDefinitions;
    
    return stackObj.targets.every((targetId, index) => {
      const isLegal = TargetingProcessor.isLegalTarget(this.state, {
        sourceId: stackObj.sourceId,
        controllerId: stackObj.controllerId,
        stackObject: stackObj,
        targetDefinitions: definitions,
        targetIndex: index
      }, targetId);
      
      if (!isLegal) {
        getProcessors(this.state).logger.debug(this.state, LogCategory.ACTION, `[FIZZLE-DEBUG] Target ${targetId} at index ${index} is ILLEGAL. Definitions: ${JSON.stringify(definitions)}`);
      }
      return !isLegal;
    });
  }

  private fizzle(stackObj: StackObject) {
    this.postResolutionCleanup(stackObj, true);
  }

  private postResolutionCleanup(stackObj: StackObject, fizzled: boolean = false) {
    if (stackObj.type === 'Spell' && stackObj.sourceObject) {
      const card = stackObj.sourceObject;
      if (fizzled) {
        if (stackObj.exileOnResolution || (stackObj as any).isCopy) {
          this.log(`[RULE 701.5] ${card.definition.name} (fizzled) was exiled instead of being put into graveyard.`);
          ActionProcessor.removeFromCurrentZone(this.state, card);
          if (!(stackObj as any).isCopy) {
            ActionProcessor.moveCard(this.state, card, Zone.Exile, card.ownerId);
          }
        } else {
          ActionProcessor.moveCard(this.state, card, Zone.Graveyard, card.ownerId);
        }
        return;
      }

      // Rule 608.2m: As the final step of resolution, the spell is put into its owner's graveyard.
      // If it's a permanent spell, it enters the battlefield instead.
      const isPermanent = RuleUtils.isPermanent(card);

      if (isPermanent) {
        // Rule 303.4: Auras enter attached to their target
        const isAura = RuleUtils.hasSubtype(card, 'aura');
        if (isAura && stackObj.targets.length > 0) {
          card.attachedTo = stackObj.targets[0];
          this.log(`${card.definition.name} enters attached to ${this.getObjectName({ id: card.attachedTo, sourceId: card.attachedTo } as any)}.`);
        }

        // Rule 110.2: Permanent enters under controller's control
        card.xValue = stackObj.xValue;
        ActionProcessor.moveCard(this.state, card, Zone.Battlefield, stackObj.controllerId);
      } else if (card.zone === Zone.Stack) {
        const freshDef = oracle.getCard(card.definition.name);
        const shouldExile = stackObj.exileOnResolution || stackObj.isCopy || card.isPreparedCopy || freshDef?.exileOnResolution;

        console.log(`[RESOLVE-DEBUG] ${card.definition.name} cleanup: shouldExile=${shouldExile} (stackObj.exileOnRes=${stackObj.exileOnResolution})`);

        if (shouldExile) {
          const reason = card.isPreparedCopy ? 'Prepared spell' : (stackObj.isCopy ? 'Copy' : (freshDef?.exileOnResolution ? 'Card Definition' : 'Effect'));
          this.log(`[RULE 701.5] ${card.definition.name} (${reason}) ceases to exist after resolution.`);

          ActionProcessor.removeFromCurrentZone(this.state, card);
          if (!(stackObj.isCopy || card.isPreparedCopy)) {
            ActionProcessor.moveCard(this.state, card, Zone.Exile, card.ownerId);
          }
        } else {
          ActionProcessor.moveCard(this.state, card, Zone.Graveyard, card.ownerId);
        }
      }
    }
  }

  private getObjectName(stackObj: StackObject): string {
    if (stackObj.type === 'Spell' && stackObj.sourceObject) return stackObj.sourceObject.definition.name;
    const source = this.state.battlefield.find(o => o.id === stackObj.sourceId);
    return source ? source.definition.name : 'Ability';
  }
}

