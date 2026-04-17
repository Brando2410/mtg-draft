import { AbilityCost, AbilityType, EffectType, GameObject, GameState, Phase, PlayerId, Zone, CostType, TargetMapping } from '@shared/engine_types';
import { oracle } from '../../OracleLogicMap';
import { ManaProcessor } from '../magic/ManaProcessor';
import { CostProcessor } from '../magic/CostProcessor';
import { TriggerProcessor } from '../effects/TriggerProcessor';
import { ActionProcessor } from './ActionProcessor';

/**
 * Casting Spells and Activating Abilities (Chapters 601 & 602)
 */
export class SpellProcessor {

    public static playCard(
        state: GameState,
        playerId: PlayerId,
        cardInstanceId: string,
        declaredTargets: string[],
        log: (m: string) => void,
        engine: {
            tapForMana: (p: PlayerId, c: string, aIdx?: number, cIdx?: number) => void;
            passPriority: (p: PlayerId) => void;
            checkAutoPass: (p: PlayerId) => void;
            checkStateBasedActions: () => void;
        },
        bypassTargeting = false
    ): boolean {
        log(`[DEBUG] SpellProcessor.playCard: Card ${cardInstanceId} by ${playerId} (BypassTargeting: ${bypassTargeting})`);
        const activeId = String(state.activePlayerId).trim();
        const callerId = String(playerId).trim();

        // 1. Priority Error (Rule 117.1)
        if (!bypassTargeting && String(state.priorityPlayerId) !== String(playerId)) {
            log(`Tried to play card without priority.`);
            return false;
        }

        if (state.pendingAction && !bypassTargeting) {
            log(`Cannot cast: Pending action ${state.pendingAction.type} must be resolved first.`);
            return false;
        }

        const player = state.players[playerId];
        if (player && player.pendingDiscardCount > 0) {
            log(`Player must finish discarding before playing cards.`);
            return false;
        }

        const cardToPlay = this.resolveCardToPlay(state, playerId, cardInstanceId, log);
        if (!cardToPlay) return false;

        // --- ACTIVATED ABILITY REDIRECTION (Graveyard) ---
        // If the card is in the graveyard and we're trying to "play" it, check if it's actually an activated ability card
        if (cardToPlay.zone === Zone.Graveyard && (state.players[playerId].hand.find((c: any) => c.id === cardInstanceId) === undefined)) {
            const { LayerProcessor } = require('./../state/LayerProcessor');
            const stats = LayerProcessor.getEffectiveStats(cardToPlay, state);
            const hasFlashback = stats.keywords?.includes('Flashback') || cardToPlay.definition.keywords?.includes('Flashback');

            if (!hasFlashback) {
                const graveAbilityIndex = cardToPlay.definition.abilities?.findIndex((a: any) =>
                    a.type === AbilityType.Activated &&
                    (a.zone === Zone.Graveyard || a.activeZone === Zone.Graveyard || a.activeZone === Zone.Graveyard)
                );

                if (graveAbilityIndex !== undefined && graveAbilityIndex !== -1) {
                    log(`[DEBUG] Converting playCard to activateAbility for ${cardToPlay.definition.name}`);
                    return this.activateAbility(state, playerId, cardInstanceId, graveAbilityIndex, declaredTargets, log, engine, bypassTargeting);
                }
            }
        }

        // --- MDFC FACE SELECTION (CR 711.1) ---
        if (cardToPlay.definition.faces && !bypassTargeting && !(cardToPlay as any).selectedFaceDefinition) {
            const { ChoiceGenerator } = require('./../effects/ChoiceGenerator');
            const { ActionType } = require('@shared/engine_types');
            state.pendingAction = ChoiceGenerator.createModalChoice({
                label: `Cast ${cardToPlay.definition.name}: Choose Face`,
                playerId: playerId,
                sourceId: cardToPlay.id,
                actionType: ActionType.ModalSelection
            }, cardToPlay.definition.faces.map((face: any, idx: number) => ({
                label: `${face.name} (${face.type_line})`,
                value: `FACE_SELECTION_${idx}`
            })));
            state.priorityPlayerId = null;
            return true;
        }

        const currentDefinition = (cardToPlay as any).selectedFaceDefinition || cardToPlay.definition;

        // Persist face choice into the object definition for Zones (Stack/Battlefield)
        if ((cardToPlay as any).selectedFaceDefinition) {
            cardToPlay.definition = (cardToPlay as any).selectedFaceDefinition;
        }

        // --- X-VALUE RESET FAIL-SAFE ---
        if (!bypassTargeting && cardToPlay.xValue !== undefined) {
            cardToPlay.xValue = undefined;
        }

        const rawTypeLine = (currentDefinition.type_line || '').toLowerCase();
        const typeLine = (cardToPlay as any).isVirtual ? rawTypeLine : rawTypeLine.split('//')[0].trim();
        const types = ((cardToPlay as any).isVirtual ? 
            (currentDefinition.types || []) : 
            rawTypeLine.split('//')[0].split(/[-—]/)[0].trim().split(/\s+/).filter(Boolean)
        ).map((t: string) => t.toLowerCase());
        
        const isLand = typeLine.includes('land') || types.includes('land');
        const isInstantOrFlash = typeLine.includes('instant') || types.includes('instant') || (currentDefinition.oracleText || '').includes('Flash');

        // Timing/Restriction check
        const isInstantOrSorcery = typeLine.includes('instant') || types.includes('instant') || typeLine.includes('sorcery') || types.includes('sorcery');
        const isFirstInstantOrSorcery = isInstantOrSorcery && !state.turnState.instantOrSorceryCastThisTurn[playerId];

        if (!this.validateCardTiming(state, playerId, cardToPlay, isInstantOrFlash, bypassTargeting, log)) {
            return false;
        }

        // 3. Land Handling (Rule 305)
        if (isLand) {
            return this.handleLandPlay(state, playerId, cardToPlay, engine, log);
        }

        // 4. Extract logic and effects
        const logic = oracle.getCard(currentDefinition.name);
        if (!logic && !isLand) {
            log(`[WARNING] No logic definition found for ${currentDefinition.name}.`);
        }

        // Priority: Oracle -> Current Definition on Object (for virtual spells/MDFCs)
        const targetDefinition = (logic as any)?.targetDefinition ||
            (logic as any)?.abilities?.find((a: any) => a.type === 'Spell')?.targetDefinition ||
            currentDefinition.targetDefinition ||
            currentDefinition.abilities?.find((a: any) => a.type === 'Spell')?.targetDefinition;

        const spellEffects = (logic as any)?.effects ||
            (logic as any)?.abilities?.find((a: any) => a.type === 'Spell')?.effects ||
            currentDefinition.effects ||
            currentDefinition.abilities?.find((a: any) => a.type === 'Spell')?.effects || [];

        const choiceEffectIndex = spellEffects.findIndex((e: any) => e.type === 'Choice' && e.choices && !e.targetMapping);
        const hasPreSelectedChoice = (state as any).lastChoiceIndex !== undefined;

        // Step 0.5: Check for X in cost or inherent logic
        const costStr = (currentDefinition.manaCost || '').split('//')[0].trim();
        // X-Value Selection
        const needsX = costStr.includes('{X}') ||
            (logic as any)?.abilities?.some((a: any) => a.costs?.some((c: any) => c.value === 'X')) ||
            (logic as any)?.effects?.some((e: any) => JSON.stringify(e).includes('"X"'));

        if (needsX && cardToPlay.xValue === undefined) {
            return this.handleXValueChoice(state, playerId, cardToPlay, declaredTargets, log);
        }

        // CR 601.2f: Determine total cost
        const { totalMana, additionalCosts, usedAlternativeCostId } = this.getEffectiveCosts(state, cardToPlay, declaredTargets, currentDefinition);
        (cardToPlay as any).usedAlternativeCostId = usedAlternativeCostId;

        // --- SETUP SEQUENCE: TARGETING -> CHOICE -> FINALIZATION ---

        // Step 1: Check Targeting
        if (targetDefinition && (!declaredTargets || declaredTargets.length === 0)) {
            const result = this.handleTargetingChoice(state, playerId, cardToPlay, targetDefinition, totalMana, cardInstanceId, log, engine);
            if (result === true || result === false) return result;
            declaredTargets = result;
        }

        // Step 1.5: Check Additional Costs (e.g. Goremand's sacrifice)
        if (this.handleInteractiveCosts(state, playerId, cardToPlay, additionalCosts, declaredTargets, cardInstanceId, log)) {
            return true;
        }

        // Step 2: Check Modal Choice
        if (choiceEffectIndex !== -1 && !hasPreSelectedChoice) {
            // Trigger choice phase (targets are already in declaredTargets if we are here)
            const choiceEffect = spellEffects[choiceEffectIndex];
            const { ActionType } = require('@shared/engine_types');
            state.pendingAction = {
                type: ActionType.ModalSelection,
                playerId: playerId,
                sourceId: cardToPlay.id,
                data: {
                    label: choiceEffect.label || 'Choose an option',
                    choices: choiceEffect.choices,
                    minChoices: choiceEffect.minChoices || 1,
                    maxChoices: choiceEffect.maxChoices || 1,
                    isSpellCasting: true,
                    declaredTargets: declaredTargets || []
                }
            };
            log(`[CHOICE] Selecting mode for ${cardToPlay.definition.name}...`);
            return true;
        }

        // Step 3: Finalization
        return this.finalizeSpellCast(state, playerId, cardToPlay, totalMana, additionalCosts, declaredTargets, spellEffects, targetDefinition, isFirstInstantOrSorcery, isInstantOrSorcery, engine, log);
    }

    public static getEffectiveCosts(state: GameState, card: GameObject, targets: string[] = [], overrideDefinition?: any, forceFlashback?: boolean, overrideStats?: any): { totalMana: string, additionalCosts: AbilityCost[], usedAlternativeCostId?: string } {
        const currentDef = overrideDefinition || card.definition;
        let baseCost = currentDef.manaCost;

        // Flashback cost override (Rule 702.34)
        // If explicitly forced or if it's a Flashback card in the graveyard, use the alternative cost
        const { LayerProcessor } = require('./../state/LayerProcessor');
        const stats = overrideStats || LayerProcessor.getEffectiveStats(card, state);

        const hasFlashbackKeyword = stats.keywords?.some((k: string) => k.toLowerCase() === 'flashback') ||
            card.definition.keywords?.some((k: string) => k.toLowerCase() === 'flashback');

        const isFlashback = forceFlashback ||
            (card as any).isFlashbackCast ||
            (card.zone === Zone.Graveyard && hasFlashbackKeyword);

        if (isFlashback) {
            let override = stats.flashbackCostOverride;
            if (override === 'SOURCE_MANA_COST') override = currentDef.manaCost;
            baseCost = currentDef.flashbackCost || (currentDef as any).flashback_cost || override || baseCost;
        } else if (card.zone === Zone.Graveyard || (Object.values(state.players) as any[]).some(p => p.virtualHand.some((v: any) => v.id === card.id))) {
            // Support for graveyard-activated abilities (e.g. Stone Docent)
            const graveyardAbility = currentDef.abilities?.find((a: any) =>
                a.type === AbilityType.Activated &&
                (a.zone === Zone.Graveyard || a.activeZone === Zone.Graveyard || a.activeZone === Zone.Graveyard)
            );
            if (graveyardAbility) {
                baseCost = (graveyardAbility as any).manaCost || (graveyardAbility as any).costs?.find((c: any) => c.type === CostType.Mana)?.value || baseCost;
            }

        }

        // Handle X cost substitution (Rule 107.3)
        if (baseCost.includes('{X}') && card.xValue !== undefined) {
            baseCost = baseCost.replace(/\{X\}/g, `{${card.xValue}}`);
        }

        const parsed = ManaProcessor.parseManaCost(baseCost);
        if ((card as any).isFreeCast) return { totalMana: "{0}", additionalCosts: [] };

        let extraGeneric = 0;
        let additionalCosts: AbilityCost[] = [];
        let effectiveCost: string | null = null;

        // 0. Check for Free Cast permissions (Alternative Costs)
        const isFree = state.ruleRegistry.continuousEffects.find(e => {
            const matchesBasic = (e.isFreeCast || (e as any).value === "ALLOW_SPELLS_FROM_HAND_WITHOUT_PAYING");
            if (!matchesBasic) return false;

            const isPlayerTarget = (e.targetMapping === 'CONTROLLER' && e.controllerId === card.controllerId);
            const isSpecificTarget = e.targetIds?.includes(card.id);
            if (!isPlayerTarget && !isSpecificTarget) return false;

            // Rule: Check limitPerTurn if defined
            if (e.limitPerTurn) {
                const used = state.turnState.triggeredAbilitiesUsedThisTurn[e.id] || 0;
                if (used >= e.limitPerTurn) return false;
            }

            // Use LayerProcessor to verify the card is actually a target (checking restrictions)
            const { LayerProcessor } = require('./../state/LayerProcessor');
            return LayerProcessor.isTarget(state, e, card.id);
        });

        if (isFree) {
            if ((isFree as any).value === "ALLOW_SPELLS_FROM_HAND_WITHOUT_PAYING" && card.zone !== Zone.Hand) {
                // Keep looking
            } else {
                effectiveCost = "{0}";
            }
        }

        if (effectiveCost !== null) return { totalMana: effectiveCost, additionalCosts, usedAlternativeCostId: isFree?.id };

        // 1. Gather global modifiers
        const { TargetingProcessor } = require('./TargetingProcessor');
        const modifiers = state.ruleRegistry.continuousEffects.filter(e => {
            if (!['SpellTax', 'CostReduction', 'AdditionalCost', 'AllowCastFromGraveyard', 'AllowPlayFromTop', 'AllowPlayExiled'].includes((e as any).type)) return false;

            const source = TargetingProcessor.findObjectInAnyZone(state, e.sourceId);
            if (source && e.activeZones && !e.activeZones.includes(source.zone)) return false;
            return true;
        });

        // 2. Add the card's OWN static additional costs (e.g. Goremand) OR inherent spell costs (e.g. Village Rites)
        const cardLogic = oracle.getCard(currentDef.name);
        if (cardLogic) {
            cardLogic.abilities?.forEach((a: any) => {
                // Case A: Static abilities that apply costs to the card itself (creatures)
                if (a.type === AbilityType.Static && a.activeZone === Zone.Hand) {
                    a.effects?.forEach((e: any) => {
                        if ((e.type === 'AdditionalCost' || e.type === 'CostReduction') && e.targetMapping === 'SELF') {
                            modifiers.push({ ...e, sourceId: card.id, controllerId: card.controllerId } as any);
                        }
                    });
                }
                // Case B: Inherent Costs inside the Spell ability itself (Instants/Sorceries)
                if ((a.type === AbilityType.Spell || a.type === 'SpellAbility') && a.costs) {
                    additionalCosts = [...additionalCosts, ...a.costs];
                }
            });
        }

        for (const mod of modifiers) {
            const type = (mod as any).type;
            const impacts = (mod.targetMapping === 'EACH_PLAYER') ||
                (mod.targetMapping === 'EACH_OPPONENT' || mod.targetMapping === 'OPPONENT') && mod.controllerId !== card.controllerId ||
                (mod.targetMapping === 'SELF' && mod.sourceId === card.id) ||
                (mod.targetMapping === 'CONTROLLER' && mod.controllerId === card.controllerId);

            if (!impacts) continue;

            const restrictions = (mod as any).restrictions || [];
            const { ConditionProcessor } = require('./../core/ConditionProcessor');

            const matches = TargetingProcessor.matchesRestrictions(state, card, (restrictions as any[] || []), card.controllerId, mod.sourceId);
            const conditionMatches = !mod.condition || ConditionProcessor.matchesCondition(state, mod.condition, mod.sourceId, card.controllerId, { data: { card: card, targets } } as any);

            if (!matches || !conditionMatches) continue;

            if (type === 'SpellTax') extraGeneric += (mod as any).amount || 0;
            if (type === 'AdditionalCost' && (mod as any).additionalCosts) {
                additionalCosts = [...additionalCosts, ...(mod as any).additionalCosts];
            }
            if (type === 'CostReduction') {
                const { EffectProcessor } = require('./../effects/EffectProcessor');
                const redAmt = EffectProcessor.resolveAmount(state, (mod as any).amount, mod.sourceId, card.controllerId, undefined, targets);
                extraGeneric -= redAmt || 0;
                if ((mod as any).manaReduction) {
                    const red = ManaProcessor.parseManaCost((mod as any).manaReduction);
                    extraGeneric -= red.generic;
                    for (const [s, c] of Object.entries(red.colored)) {
                        parsed.colored[s] = Math.max(0, (parsed.colored[s] || 0) - (c as number));
                    }
                }
            }
            if (type === 'AdditionalCost' || type === 'AllowCastFromGraveyard' || type === 'AllowPlayExiled') {
                const extra = (mod as any).additionalCosts || (mod as any).costs || [];
                additionalCosts = [...additionalCosts, ...extra];
            }
        }

        let finalGeneric = Math.max(0, parsed.generic + extraGeneric);

        // --- CHOICE COST RESOLUTION ---
        const choiceCostIndex = additionalCosts.findIndex(c => (c.type as string) === 'Choice');
        if (choiceCostIndex !== -1) {
            const choice = additionalCosts[choiceCostIndex];
            const chosenIndex = (state as any).lastChosenCostChoiceIndex;
            if (chosenIndex !== undefined && choice.choices?.[chosenIndex]) {
                const chosenCosts = choice.choices[chosenIndex].costs;
                // Remove the choice and insert its components
                additionalCosts.splice(choiceCostIndex, 1, ...chosenCosts);

                // Add any mana costs from the choice to the total
                chosenCosts.forEach(cc => {
                    if (cc.type === 'Mana') {
                        const ccParsed = ManaProcessor.parseManaCost(cc.value);
                        finalGeneric += ccParsed.generic;
                        Object.entries(ccParsed.colored).forEach(([s, c]) => {
                            parsed.colored[s] = (parsed.colored[s] || 0) + (c as number);
                        });
                    }
                });
            }
        }

        let costStr = '';
        const { xCount } = parsed;
        for (let i = 0; i < xCount; i++) costStr += '{X}';

        Object.entries(parsed.colored).forEach(([symbol, count]) => {
            for (let i = 0; i < count; i++) costStr += `{${symbol}}`;
        });

        if (finalGeneric > 0 || (costStr === '' && finalGeneric === 0)) {
            costStr = `{${finalGeneric}}` + costStr;
        }

        return { totalMana: costStr, additionalCosts };
    }

    public static activateAbility(
        state: GameState,
        playerId: PlayerId,
        cardId: string,
        abilityIndex: number,
        declaredTargets: string[] = [],
        log: (m: string) => void,
        engine: any,
        bypassTargeting: boolean = false,
        preSelectedChoice?: number
    ): boolean {
        const { TargetingProcessor } = require('./TargetingProcessor');
        const obj = TargetingProcessor.findObjectInAnyZone(state, cardId);
        if (!obj) return false;

        const player = state.players[playerId];
        if (!player) return false;

        if (!bypassTargeting && String(state.priorityPlayerId) !== String(playerId)) {
            log(`Tried to activate ability without priority.`);
            return false;
        }

        // ARCHITECTURAL NOTE: Bypassing Pending Actions
        // When bypassTargeting is true (during auto-tap), we ignore the presence of other 
        // pending actions. This is necessary because land-tapping often triggers 
        // sub-effects (like choice modals) which we have already pre-resolved.
        if (state.pendingAction && !bypassTargeting) {
            log(`Cannot activate ability: Pending action ${state.pendingAction.type} must be resolved first.`);
            return false;
        }

        const cardLogic = oracle.getCard(obj.definition.name);
        if (!cardLogic || !cardLogic.abilities || !cardLogic.abilities[abilityIndex]) return false;
        if (obj.definition.name === "Teferi, Master of Time") {
            const ability = cardLogic.abilities[abilityIndex];
            log(`[DEBUG] Activating Teferi ability index ${abilityIndex} (${ability.id}): ${JSON.stringify(obj.definition, null, 2)}`);
        }

        const ability = cardLogic.abilities[abilityIndex];
        if (ability.type !== AbilityType.Activated) return false;

        // Step 1: Preliminary Validation (Zone, Costs, Requirements, Limits)
        if (!this.validateAbilityActivation(state, playerId, obj, ability, abilityIndex, log)) {
            return false;
        }

        // Step 1.5: Choose X
        if (this.handleAbilityXChoice(state, playerId, obj, abilityIndex, declaredTargets, log)) {
            return true;
        }

        // Step 1.6: Speed/Timing Check
        if (!this.validateAbilitySpeed(state, playerId, obj, ability, cardLogic, log)) {
            return false;
        }

        // Step 2: Interactive Cost Selection
        const costResult = this.handleAbilityInteractiveCosts(state, playerId, obj, ability, abilityIndex, declaredTargets, log);
        if (costResult === true) return true;
        if (costResult === false) return false;

        // Step 3: Targeting (Rule 602.2b)
        if (ability.targetDefinition && (declaredTargets === undefined || declaredTargets.length === 0) && !bypassTargeting) {
            const targetingResult = this.handleAbilityTargeting(state, playerId, cardId, obj, ability, abilityIndex, log, engine, preSelectedChoice);
            if (targetingResult) return true; // Handled pending action or single target recursion
        }

        // Step 4: Finalization (Rule 602.2h)
        return this.finalizeAbilityActivation(state, playerId, obj, ability, abilityIndex, declaredTargets || [], log, engine, preSelectedChoice);
    }

    private static handleLandPlay(state: GameState, playerId: PlayerId, cardToPlay: GameObject, engine: any, log: (m: string) => void): boolean {
        const player = state.players[playerId];
        let maxLands = 1;
        // Support for cards like Azusa that add additional land plays
        state.ruleRegistry.continuousEffects.forEach(effect => {
            if ((effect as any).type === 'AdditionalLandPlays' && effect.targetMapping === 'CONTROLLER' && effect.controllerId === playerId) {
                maxLands += ((effect as any).amount as number) || 0;
            }
        });

        const currentLandsPlayed = state.turnState.landsPlayedThisTurn[playerId] || 0;

        if (currentLandsPlayed >= maxLands) {
            log(`Illegal Play: Already reached land play limit of ${maxLands} this turn.`);
            return false;
        }

        // Rule 305: Playing a land is a special action, not a spell.
        const { ActionProcessor } = require('./ActionProcessor');
        ActionProcessor.moveCard(state, cardToPlay, Zone.Battlefield, playerId, log);

        state.turnState.landsPlayedThisTurn[playerId] = currentLandsPlayed + 1;
        player.hasPlayedLandThisTurn = true;
        log(`Played Land: ${cardToPlay.definition.name} (${currentLandsPlayed + 1}/${maxLands})`);
        engine.checkStateBasedActions();
        return true;
    }

    private static resolveCardToPlay(state: GameState, playerId: PlayerId, cardInstanceId: string, log: (m: string) => void): GameObject | null {
        const player = state.players[playerId];
        const { PriorityProcessor } = require('./../core/PriorityProcessor');
        const { TargetingProcessor } = require('./TargetingProcessor');

        // 1. Search in Hand
        const cardInHand = player.hand.find((c: any) => c.id === cardInstanceId);
        if (cardInHand) return cardInHand;

        // 2. Search in Non-hand zones with Permission Check
        const obj = TargetingProcessor.findObjectInAnyZone(state, cardInstanceId);
        if (obj && obj.controllerId === playerId) {
            let permissionType: string | undefined;
            if (obj.zone === Zone.Graveyard) permissionType = EffectType.AllowCastFromGraveyard;
            else if (obj.zone === Zone.Exile) permissionType = EffectType.AllowPlayExiled;
            else if (obj.zone === Zone.Library) permissionType = EffectType.AllowPlayFromTop;

            const { LayerProcessor } = require('./../state/LayerProcessor');
            const stats = LayerProcessor.getEffectiveStats(obj, state);
            const hasFlashback = obj.zone === Zone.Graveyard && (stats.keywords?.includes('Flashback') || obj.definition.keywords?.includes('Flashback'));

            if (hasFlashback) {
                (obj as any).isFlashbackCast = true;
                log(`[FLASHBACK] Casting ${obj.definition.name} via flashback.`);
                return obj;
            }

            const hasGraveAbility = obj.zone === Zone.Graveyard && obj.definition.abilities?.some((a: any) =>
                a.type === AbilityType.Activated &&
                (a.zone === Zone.Graveyard || a.activeZone === Zone.Graveyard)
            );

            if (hasGraveAbility) return obj;

            if (permissionType) {
                const hasPermission = PriorityProcessor.findPermissionEffect(state, playerId, permissionType, obj.id);
                if (hasPermission) return obj;
                log(`[DEBUG] No ${permissionType} permission found for ${obj.definition.name} in ${obj.zone}.`);
            }
        }

        // 3. Search for Prepared Creatures on Battlefield
        const realId = cardInstanceId.startsWith('virtual_prepared_') ? cardInstanceId.replace('virtual_prepared_', '') : cardInstanceId;
        const preparedObj = state.battlefield.find(o => o.id === realId && o.controllerId === playerId && o.isPrepared);
        if (preparedObj && (preparedObj.definition.preparedFace || preparedObj.definition.faces?.[1])) {
            const face = preparedObj.definition.preparedFace || preparedObj.definition.faces![1];
            return {
                ...preparedObj,
                id: `copy_${preparedObj.id}_${Date.now()}`,
                definition: face,
                zone: Zone.Battlefield,
                isPreparedCopy: true,
                sourceCreatureId: preparedObj.id
            } as any;
        }

        // 4. Search for Paradigm Virtual Copies
        if ((state as any).paradigmCopies && (state as any).paradigmCopies[cardInstanceId]) {
            return (state as any).paradigmCopies[cardInstanceId];
        }

        return null;
    }
    private static validateCardTiming(state: GameState, playerId: PlayerId, cardToPlay: GameObject, isInstantOrFlash: boolean, bypassTargeting: boolean, log: (m: string) => void): boolean {
        const { RestrictionProcessor } = require('./RestrictionProcessor');

        // Rule 101.2: "Cannot" wins
        if (!RestrictionProcessor.isCastAllowed(state, playerId, cardToPlay)) {
            log(`Illegal Action: Casting ${cardToPlay.definition.name} is currently restricted.`);
            return false;
        }

        // Rule 305/307: Timing
        if (!isInstantOrFlash && !bypassTargeting) {
            const activeId = String(state.activePlayerId).trim();
            const callerId = String(playerId).trim();
            if (activeId !== callerId || (state.currentPhase !== Phase.PreCombatMain && state.currentPhase !== Phase.PostCombatMain) || state.stack.length > 0) {
                log(`Illegal Play: Cannot cast sorcery speed spell/land right now.`);
                return false;
            }
        }
        return true;
    }

    private static handleXValueChoice(state: GameState, playerId: PlayerId, cardToPlay: GameObject, declaredTargets: string[], log: (m: string) => void): boolean {
        const { ActionType } = require('@shared/engine_types');
        state.pendingAction = {
            type: ActionType.ChooseX,
            playerId: playerId,
            sourceId: cardToPlay.id,
            data: {
                label: `Choose a value for X for ${cardToPlay.definition.name}`,
                declaredTargets: declaredTargets || [],
            }
        };
        log(`[CHOOSE_X] ${state.players[playerId].name} is choosing X for ${cardToPlay.definition.name}...`);
        return true;
    }

    private static handleTargetingChoice(
        state: GameState,
        playerId: PlayerId,
        cardToPlay: GameObject,
        targetDefinition: any,
        totalMana: string,
        cardInstanceId: string,
        log: (m: string) => void,
        engine: any
    ): boolean | string[] {
        const { TargetingProcessor } = require('./TargetingProcessor');
        const player = state.players[playerId];
        cardToPlay.controllerId = cardToPlay.controllerId || playerId;

        if (!ManaProcessor.canPayWithTotal(player, state.battlefield, totalMana)) {
            log(`Illegal Play: Not enough mana available to even start casting ${cardToPlay.definition.name}.`);
            cardToPlay.xValue = undefined; // Cleanup for next attempt
            return false;
        }

        const pool = [
            ...Object.keys(state.players),
            ...state.battlefield.map(o => o.id),
            ...state.exile.map(o => o.id),
            ...state.stack.map(o => o.id),
            ...Object.values(state.players).flatMap(p => p.graveyard.map(c => c.id))
        ];

        const firstDef = TargetingProcessor.getDefinitionForIndex(targetDefinition, 0);
        const legalForFirst = pool.filter(tid => TargetingProcessor.isLegalTarget(state, cardToPlay, tid, targetDefinition, 0));

        const firstType = (firstDef.type || '').toLowerCase();
        const firstRestrictions = (firstDef.restrictions || []).map((r: any) => typeof r === 'string' ? r.toLowerCase() : r);
        const isOpponentTarget = firstType === 'opponent' || (firstType === 'player' && firstRestrictions.includes('opponent'));

        const isSingleOpponentTarget = isOpponentTarget &&
            legalForFirst.length === 1;

        if (isSingleOpponentTarget) {
            const opponentId = legalForFirst[0];
            log(`[AUTO-TARGET] Automatically targeting the only opponent for ${cardToPlay.definition.name}.`);
            
            const { maxCount, minCount, count } = TargetingProcessor.calculateTotalCounts(targetDefinition, cardToPlay.xValue || 0);
            
            // If the spell only needs 1 target, we are done!
            if (maxCount === 1) {
                return [opponentId];
            }

            // Otherwise, we auto-select the first and continue to the next
            const autoSelected = [opponentId];
            const nextIndex = autoSelected.length;
            const nextDef = TargetingProcessor.getDefinitionForIndex(targetDefinition, nextIndex);
            const prompt = TargetingProcessor.generateTargetPrompt(targetDefinition, nextIndex, cardToPlay.xValue || 0, true);

            state.pendingAction = {
                type: 'TARGETING',
                playerId: playerId,
                sourceId: cardToPlay.id,
                data: {
                    targetDefinition,
                    targets: pool.filter(tid => TargetingProcessor.isLegalTarget(state, cardToPlay, tid, targetDefinition, nextIndex)),
                    selectedTargets: autoSelected,
                    label: nextDef.label,
                    isSpellCasting: true,
                    xValue: cardToPlay.xValue,
                    maxCount,
                    minCount,
                    count,
                    prompt
                }
            };
            log(`[AUTO-TARGET] Opponent selected. Now selecting secondary targets...`);
            return true;
        }

        const precalculatedTargets = legalForFirst; // Default view for first selection step

        if (precalculatedTargets.length === 0) {
            if (targetDefinition.optional || firstDef.optional || firstDef.minCount === 0) {
                log(`No legal targets found for first requirement, auto-skipping.`);
                return []; 
            } else {
                log(`Illegal Play: No valid targets available for ${cardToPlay.definition.name}.`);
                return false;
            }
        }

        const { maxCount, minCount, count } = TargetingProcessor.calculateTotalCounts(targetDefinition, cardToPlay.xValue || 0);
        const prompt = TargetingProcessor.generateTargetPrompt(targetDefinition, 0, cardToPlay.xValue || 0, true);
        state.pendingAction = {
            type: 'TARGETING',
            playerId: playerId,
            sourceId: cardToPlay.id,
            data: {
                targetDefinition,
                targets: precalculatedTargets,
                isSpellCasting: true,
                xValue: cardToPlay.xValue,
                maxCount,
                minCount,
                count,
                prompt
            }
        };
        log(`[TARGETING] ${state.players[playerId].name} is selecting targets for ${cardToPlay.definition.name}...`);
        return true;
    }

    private static handleInteractiveCosts(
        state: GameState,
        playerId: PlayerId,
        cardToPlay: GameObject,
        additionalCosts: AbilityCost[],
        declaredTargets: string[],
        cardInstanceId: string,
        log: (m: string) => void
    ): boolean {
        const { TargetingProcessor } = require('./TargetingProcessor');
        const { ActionType, CostType } = require('@shared/engine_types');
        const player = state.players[playerId];

        log(`[DEBUG] Additional costs found: ${additionalCosts.length} -> ${JSON.stringify(additionalCosts)}`);
        
        // 1. Choice Cost
        const choiceCost = additionalCosts.find(c => (c.type as string) === 'Choice');
        const hasChosenCostChoice = (state as any).lastChosenCostChoiceIndex !== undefined;

        if (choiceCost && !hasChosenCostChoice) {
            state.pendingAction = {
                type: ActionType.ModalSelection,
                playerId: playerId,
                sourceId: cardToPlay.id,
                data: {
                    label: choiceCost.label || "Choose an additional cost",
                    hideUndo: false,
                    isCostChoice: true,
                    costType: 'Choice',
                    declaredTargets: declaredTargets || [],
                    choices: choiceCost.choices?.map((c, idx) => ({
                        label: c.label,
                        value: `COST_CHOICE_${idx}`,
                        selectable: true
                    }))
                }
            };
            log(`[COST_CHOICE] ${state.players[playerId].name} must choose an additional cost for ${cardToPlay.definition.name}.`);
            return true;
        }

        // 2. Sacrifice Cost
        const sacrificeCost = additionalCosts.find(c => c.type === 'Sacrifice' && !c.targetMapping);
        const hasChosenSacrifice = (state as any).lastChosenSacrificeId !== undefined;

        if (sacrificeCost && !hasChosenSacrifice) {
            const legalSacrificeIds = state.battlefield
                .filter(o => o.controllerId === playerId && TargetingProcessor.matchesRestrictions(state, o, sacrificeCost.restrictions || [], playerId, cardToPlay.id))
                .map(o => o.id);

            if (legalSacrificeIds.length === 0) {
                log(`Illegal Play: No valid objects to sacrifice for ${cardToPlay.definition.name}.`);
                return false;
            }

            state.pendingAction = {
                type: ActionType.ModalSelection,
                playerId: playerId,
                sourceId: cardToPlay.id,
                data: {
                    label: "Sacrifice a creature to cast " + cardToPlay.definition.name,
                    hideUndo: false,
                    isCostChoice: true,
                    costType: 'Sacrifice',
                    declaredTargets: declaredTargets || [],
                    choices: legalSacrificeIds.map(id => {
                        const obj = state.battlefield.find(o => o.id === id);
                        return { label: `Sacrifice ${obj?.definition.name || id}`, value: id, cardData: obj, selectable: true }
                    })
                }
            };
            log(`[SACRIFICE] ${state.players[playerId].name} must choose an object to sacrifice.`);
            return true;
        }

        // 3. Discard Cost
        const discardCost = additionalCosts.find(c => c.type === CostType.Discard);
        const hasChosenDiscard = (state as any).lastChosenDiscardId !== undefined;

        if (discardCost && !hasChosenDiscard) {
            const legalDiscardIds = player.hand
                .filter(c => c.id !== cardInstanceId && TargetingProcessor.matchesRestrictions(state, c, discardCost.restrictions || [], playerId, cardToPlay.id))
                .map(c => c.id);

            if (legalDiscardIds.length === 0) {
                log(`Illegal Play: No valid cards to discard for ${cardToPlay.definition.name}.`);
                return false;
            }

            state.pendingAction = {
                type: ActionType.ModalSelection,
                playerId: playerId,
                sourceId: cardToPlay.id,
                data: {
                    label: "Discard a card to cast " + cardToPlay.definition.name,
                    hideUndo: false,
                    isCostChoice: true,
                    costType: 'Discard',
                    minChoices: 1,
                    maxChoices: 1,
                    declaredTargets: declaredTargets || [],
                    choices: legalDiscardIds.map(id => {
                        const c = player.hand.find(o => o.id === id)!;
                        return { label: `Discard ${c.definition.name}`, value: id, cardData: c, selectable: true }
                    })
                }
            };
            log(`[DISCARD] ${state.players[playerId].name} must choose a card to discard.`);
            return true;
        }

        // 4. Exile Cost
        const exileCost = additionalCosts.find(c => c.type === 'Exile' && !c.targetMapping);
        const hasChosenExile = (state as any).lastChosenExileIds !== undefined;

        if (exileCost && !hasChosenExile) {
            const zones = exileCost.sourceZones || (exileCost.sourceZone ? [exileCost.sourceZone] : [Zone.Battlefield]);
            const pool = zones.flatMap(z => {
                if (z === Zone.Battlefield) return state.battlefield.filter(o => o.controllerId === playerId);
                if (z === Zone.Graveyard) return player.graveyard;
                if (z === Zone.Hand) return player.hand;
                return [];
            });

            const legalExileIds = pool
                .filter(c => TargetingProcessor.matchesRestrictions(state, c, exileCost.restrictions || [], playerId, cardToPlay.id))
                .map(c => c.id);

            const amount = exileCost.amount || 1;
            if (legalExileIds.length < amount) {
                log(`Illegal Play: Not enough valid objects to exile for ${cardToPlay.definition.name}.`);
                return false;
            }

            state.pendingAction = {
                type: ActionType.ModalSelection,
                playerId: playerId,
                sourceId: cardToPlay.id,
                data: {
                    label: `Exile ${amount} card(s) to cast ` + cardToPlay.definition.name,
                    hideUndo: false,
                    isCostChoice: true,
                    costType: 'Exile',
                    minChoices: amount,
                    maxChoices: amount,
                    declaredTargets: declaredTargets || [],
                    choices: legalExileIds.map(id => {
                        const obj = pool.find(o => o.id === id);
                        return { label: `Exile ${obj?.definition?.name || id}`, value: id, cardData: obj, selectable: true }
                    })
                }
            };
            log(`[EXILE] ${state.players[playerId].name} must choose objects to exile.`);
            return true;
        }

        return false;
    }

    private static finalizeSpellCast(
        state: GameState,
        playerId: PlayerId,
        cardToPlay: GameObject,
        totalMana: string,
        additionalCosts: AbilityCost[],
        declaredTargets: string[],
        spellEffects: any[],
        targetDefinition: any,
        isFirstInstantOrSorcery: boolean,
        isInstantOrSorcery: boolean,
        engine: any,
        log: (m: string) => void
    ): boolean {
        const player = state.players[playerId];
        const { ActionProcessor } = require('./ActionProcessor');
        const { TargetingProcessor } = require('./TargetingProcessor');
        const { TriggerProcessor } = require('./../effects/TriggerProcessor');
        const { AbilityType, Zone, CostType } = require('@shared/engine_types');

        // Modal Choice check (modes like "Choose one")
        const choiceEffectIndex = spellEffects.findIndex((e: any) => e.type === 'Choice' && e.choices && !e.targetMapping);
        const hasPreSelectedChoice = (state as any).lastChoiceIndex !== undefined;

        if (choiceEffectIndex !== -1 && !hasPreSelectedChoice) {
            const choiceEffect = spellEffects[choiceEffectIndex];
            const { ActionType } = require('@shared/engine_types');
            state.pendingAction = {
                type: ActionType.ModalSelection,
                playerId: playerId,
                sourceId: cardToPlay.id,
                data: {
                    label: choiceEffect.label || 'Choose an option',
                    choices: choiceEffect.choices,
                    minChoices: choiceEffect.minChoices || 1,
                    maxChoices: choiceEffect.maxChoices || 1,
                    isSpellCasting: true,
                    declaredTargets: declaredTargets || []
                }
            };
            log(`[CHOICE] Selecting mode for ${cardToPlay.definition.name}...`);
            return true;
        }

        const preSelectedChoice = (state as any).lastChoiceIndex;
        delete (state as any).lastChoiceIndex;

        // Pay Mana
        const hasConfirmedAutoTap = (state as any).confirmedAutoTap;
        delete (state as any).confirmedAutoTap;

        if (!ManaProcessor.canPayManaCost(player, totalMana, state, cardToPlay)) {
            if (ManaProcessor.canPayWithTotal(player, state.battlefield, totalMana, cardToPlay)) {
                if (hasConfirmedAutoTap) {
                    log(`Using pre-confirmed auto-tap for ${totalMana}...`);
                    ManaProcessor.autoTapLandsForCost(state, playerId, totalMana, log, engine.tapForMana, cardToPlay);
                } else {
                    log(`Auto-tapping lands to pay ${totalMana}...`);
                    const manaSnapshot = JSON.parse(JSON.stringify(player.manaPool));
                    const restrictedSnapshot = JSON.parse(JSON.stringify(player.restrictedMana || []));
                    const { tappedIds, producedMana } = ManaProcessor.autoTapLandsForCost(state, playerId, totalMana, log, engine.tapForMana, cardToPlay);
                    
                    if (tappedIds.length > 0) {
                        const { ActionType } = require('@shared/engine_types');
                        state.pendingAction = {
                            type: ActionType.ModalSelection,
                            playerId: playerId,
                            sourceId: cardToPlay.id,
                            data: {
                                label: `Confirm auto-tap for ${cardToPlay.definition.name}?`,
                                choices: [
                                    { label: `Confirm Cast (${totalMana})`, value: 'confirm' }
                                ],
                                isSpellCasting: true,
                                confirmedAutoTap: true,
                                totalMana,
                                declaredTargets: declaredTargets || [],
                                tappedLandIds: tappedIds,
                                producedMana,
                                manaSnapshot,
                                restrictedSnapshot
                            }
                        };
                        return true;
                    }
                }
            } else {
                log(`Illegal Play: Not enough mana for ${cardToPlay.definition.name} (Effective Cost: ${totalMana})`);
                return false;
            }
        }

        log(`Paying ${totalMana} for ${cardToPlay.definition.name}...`);
        const colorsSpent = ManaProcessor.deductManaCost(player, totalMana, state, cardToPlay);
        (cardToPlay as any).colorsSpent = colorsSpent;
        (cardToPlay as any).convergeAmount = colorsSpent.length;

        // Pay Additional Costs
        additionalCosts.forEach(cost => {
            if (cost.type === 'Sacrifice') {
                const chosenId = (state as any).lastChosenSacrificeId;
                const obj = state.battlefield.find(o => o.id === (chosenId || cardToPlay.id));
                if (obj) {
                    TriggerProcessor.onEvent(state, { type: 'ON_SACRIFICE', playerId, sourceId: obj.id, data: { object: obj } }, log);
                    ActionProcessor.moveCard(state, obj, Zone.Graveyard, playerId, log);
                    log(`Paid additional cost: Sacrificed ${obj.definition.name}.`);
                    if ((cost as any).isCasualty) (state as any).paidCasualtyFor = cardToPlay.id;
                }
            } else if (cost.type === 'Discard') {
                const chosenId = (state as any).lastChosenDiscardId;
                const obj = player.hand.find(o => o.id === chosenId);
                if (obj) {
                    TriggerProcessor.onEvent(state, { type: 'ON_DISCARD', playerId, data: { card: obj, sourceId: cardToPlay.id } }, log);
                    ActionProcessor.moveCard(state, obj, Zone.Graveyard, playerId, log);
                    log(`Paid additional cost: Discarded ${obj.definition.name}.`);
                }
            } else if (cost.type === 'PayLife') {
                const lifeVal = cost.value === 'X' ? (cardToPlay.xValue || 0) : (parseInt(cost.value as string) || 0);
                player.life -= lifeVal;
                TriggerProcessor.onEvent(state, { type: 'ON_LIFE_LOSS', playerId, amount: lifeVal }, log);
                log(`Paid additional cost: ${lifeVal} life.`);
            } else if (cost.type === 'Exile') {
                const chosenIds = (state as any).lastChosenExileIds || [];
                chosenIds.forEach((cid: string) => {
                    const obj = TargetingProcessor.findObjectInAnyZone(state, cid);
                    if (obj) {
                        ActionProcessor.moveCard(state, obj, Zone.Exile, playerId, log);
                        log(`Paid additional cost: Exiled ${obj.definition?.name || cid}.`);
                    }
                });
            }
        });

        // Cleanup temporary selection state
        delete (state as any).lastChosenSacrificeId;
        delete (state as any).lastChosenDiscardId;
        delete (state as any).lastChosenExileIds;
        delete (state as any).lastChosenCostChoiceIndex;

        // Move to Stack
        const lastZone = cardToPlay.zone;
        if (!(cardToPlay as any).isPreparedCopy) {
            ActionProcessor.moveCard(state, cardToPlay, Zone.Stack, playerId, log);
        } else {
            cardToPlay.zone = Zone.Stack;
            cardToPlay.lastNonStackZone = lastZone;
        }

        (cardToPlay as any).paidCost = totalMana;
        (cardToPlay as any).paidManaValue = ManaProcessor.getManaValue(totalMana);

        // Limit tracking
        if ((cardToPlay as any).paidCost === "{0}" && (cardToPlay as any).usedAlternativeCostId) {
            const effectId = (cardToPlay as any).usedAlternativeCostId;
            state.turnState.triggeredAbilitiesUsedThisTurn[effectId] = (state.turnState.triggeredAbilitiesUsedThisTurn[effectId] || 0) + 1;
        }

        // Unprepare source if MDFC/SOS
        if ((cardToPlay as any).isPreparedCopy && (cardToPlay as any).sourceCreatureId) {
            const source = state.battlefield.find(o => o.id === (cardToPlay as any).sourceCreatureId);
            if (source) source.isPrepared = false;
        }

        if (isInstantOrSorcery) state.turnState.instantOrSorceryCastThisTurn[playerId] = true;
        state.turnState.spellsCastThisTurn[playerId] = (state.turnState.spellsCastThisTurn[playerId] || 0) + 1;

        // Triggers: ON_SECOND_SPELL_CAST, etc.
        if (state.turnState.spellsCastThisTurn[playerId] === 2) TriggerProcessor.onEvent(state, { type: 'ON_SECOND_SPELL_CAST', playerId, data: {} }, log);
        if (state.turnState.spellsCastThisTurn[playerId] === 3) TriggerProcessor.onEvent(state, { type: 'ON_THIRD_SPELL_CAST', playerId, data: {} }, log);

        const exileOnResolution = (state.ruleRegistry.continuousEffects.some(e =>
            e.exileOnMoveToGraveyard && (e.targetIds?.includes(cardToPlay.id) || (e.targetMapping === 'CONTROLLER' && e.controllerId === playerId))
        )) || (cardToPlay as any).isFlashbackCast || cardToPlay.definition?.exileOnResolution;

        const targetsControllers = (declaredTargets || []).map(tid => {
            const obj = TargetingProcessor.findObjectInAnyZone(state, tid);
            return obj ? obj.controllerId : null;
        });

        const stackObj = {
            id: `spell_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            controllerId: playerId,
            sourceId: cardToPlay.id,
            type: 'Spell' as const,
            targets: declaredTargets || [],
            card: cardToPlay,
            definition: cardToPlay.definition,
            xValue: cardToPlay.xValue,
            exileOnResolution: exileOnResolution,
            isFlashbackCast: (cardToPlay as any).isFlashbackCast,
            data: { effects: spellEffects, targetDefinition, preSelectedChoice, targetsControllers }
        };

        state.stack.push(stackObj);

        // Casualty
        if ((state as any).paidCasualtyFor === cardToPlay.id) {
            delete (state as any).paidCasualtyFor;
            state.stack.push({
                id: `casualty_trigger_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                controllerId: playerId,
                sourceId: stackObj.id,
                type: AbilityType.Triggered as any,
                name: `Casualty Copy (${stackObj.definition.name})`,
                image_url: stackObj.definition.image_url,
                targets: [],
                data: { effects: [{ type: 'CopySpellOnStack', targetMapping: 'SOURCE_OBJECT', chooseNewTargets: true }] }
            });
            log(`[CASUALTY] Copy trigger for ${stackObj.definition.name} placed on stack.`);
        }

        // Fire targeting triggers
        (declaredTargets || []).forEach(tid => {
            TriggerProcessor.onEvent(state, { type: 'ON_BECOME_TARGET', playerId, targetId: tid, data: { sourceId: stackObj.id, sourceCard: cardToPlay } }, log);
        });

        state.consecutivePasses = 0;
        TriggerProcessor.onEvent(state, { type: 'ON_CAST_SPELL', playerId, amount: (cardToPlay as any).paidManaValue || 0, data: { card: cardToPlay, sourceId: cardToPlay.id, stackSnapshot: JSON.parse(JSON.stringify(stackObj)) } }, log);
        
        if (isFirstInstantOrSorcery) TriggerProcessor.onEvent(state, { type: 'ON_CAST_FIRST_INSTANT_SORCERY', playerId, amount: (cardToPlay as any).paidManaValue || 0, data: { card: cardToPlay, sourceId: cardToPlay.id, stackSnapshot: JSON.parse(JSON.stringify(stackObj)) } }, log);
        if (isInstantOrSorcery) TriggerProcessor.onEvent(state, { type: 'ON_CAST_INSTANT_SORCERY', playerId, amount: (cardToPlay as any).paidManaValue || 0, data: { card: cardToPlay, sourceId: cardToPlay.id, stackSnapshot: JSON.parse(JSON.stringify(stackObj)) } }, log);
        
        if (!cardToPlay.definition.types.some((t: string) => t.toLowerCase() === 'creature')) {
            TriggerProcessor.onEvent(state, { type: 'ON_CAST_NON_CREATURE', playerId, data: { card: cardToPlay, sourceId: cardToPlay.id } }, log);
        }

        log(`--------------------------------------------------`);
        log(`[STACK] + ${state.players[playerId].name} cast ${cardToPlay.definition.name}${declaredTargets?.length ? ' targeting ' + declaredTargets.join(', ') : ''}`);
        log(`--------------------------------------------------`);

        engine.checkAutoPass(playerId);
        return true;
    }

    private static validateAbilityActivation(state: GameState, playerId: PlayerId, obj: GameObject, ability: any, abilityIndex: number, log: (m: string) => void): boolean {
        const { Zone } = require('@shared/engine_types');
        const activeZone = ability.activeZone || Zone.Battlefield;
        if (activeZone !== Zone.Any && activeZone !== (obj.zone as any)) {
            log(`Illegal Activation: ${obj.definition.name}'s ability cannot be activated from ${obj.zone}.`);
            return false;
        }

        if (!CostProcessor.canPay(state, ability.costs || [], obj.id, playerId)) {
            log(`Illegal Activation: Cannot pay costs for ${obj.definition.name}'s ability.`);
            return false;
        }

        if (ability.triggerCondition && !ability.triggerCondition(state, null, { sourceId: obj.id, controllerId: playerId })) {
            log(`Illegal Activation: Activation requirements for ${obj.definition.name} are not met.`);
            return false;
        }

        if (ability.limitPerTurn) {
            const usedCount = state.turnState.triggeredAbilitiesUsedThisTurn[`ability_${obj.id}_${abilityIndex}`] || 0;
            if (usedCount >= ability.limitPerTurn) {
                log(`Illegal Activation: This ability has already been used ${usedCount} times this turn.`);
                return false;
            }
        }
        return true;
    }

    private static handleAbilityXChoice(state: GameState, playerId: PlayerId, obj: GameObject, abilityIndex: number, declaredTargets: string[] | undefined, log: (m: string) => void): boolean {
        const { ActionType } = require('@shared/engine_types');
        const ability = (obj.definition.abilities as any)?.[abilityIndex];
        if (!ability) return false;
        const needsX = (ability.effects as any[])?.some((e: any) => e.value === 'X' || e.amount === 'X' || (e.costs && e.costs.some((c: any) => c.value === 'X')));
        const xValue = (state as any).lastChoiceX;

        if (needsX && xValue === undefined) {
            state.pendingAction = {
                type: ActionType.ChooseX,
                playerId: playerId,
                sourceId: obj.id,
                data: {
                    abilityIndex: abilityIndex,
                    label: `Choose a value for X for ${obj.definition.name}'s ability`,
                    declaredTargets: declaredTargets || [],
                }
            };
            log(`[CHOOSE_X] ${state.players[playerId].name} is choosing X for ${obj.definition.name}'s ability...`);
            return true;
        }

        if (xValue !== undefined) {
            (obj as any).xValue = xValue;
            delete (state as any).lastChoiceX;
        }
        return false;
    }

    private static validateAbilitySpeed(state: GameState, playerId: PlayerId, obj: GameObject, ability: any, cardLogic: any, log: (m: string) => void): boolean {
        const { Phase, EffectType, TargetMapping } = require('@shared/engine_types');
        const isPlaneswalker = obj.definition.types.includes('Planeswalker');
        const isSorceryOnly = ability.activatedOnlyAsSorcery || (ability as any).isSorcerySpeed;

        if (isPlaneswalker || isSorceryOnly) {
            const activeId = String(state.activePlayerId).trim();
            const isMainPhase = (state.currentPhase === Phase.PreCombatMain || state.currentPhase === Phase.PostCombatMain);
            const stackEmpty = state.stack.length === 0;
            const isSorcerySpeed = String(playerId) === activeId && isMainPhase && stackEmpty;
            const canActivateAnyTime = (cardLogic.abilities || []).some((a: any) => a.type === 'Static' && String(a.id).includes('any_turn')) ||
                state.ruleRegistry.continuousEffects.some(e =>
                    e.type === EffectType.AllowOutOfTurnActivation &&
                    (e.targetIds?.includes(obj.id) || (e.targetMapping === TargetMapping.Self && e.sourceId === obj.id))
                );

            if (!canActivateAnyTime && !isSorcerySpeed) {
                log(`Illegal Activation: This ability can only be activated at sorcery speed.`);
                return false;
            }

            if (isPlaneswalker && obj.abilitiesUsedThisTurn > 0) {
                log(`Illegal Activation: This permanent's activated abilities have already been used this turn.`);
                return false;
            }
        }
        return true;
    }

    private static handleAbilityInteractiveCosts(state: GameState, playerId: PlayerId, obj: GameObject, ability: any, abilityIndex: number, declaredTargets: string[] | undefined, log: (m: string) => void): boolean | null {
        const { ActionType, Zone } = require('@shared/engine_types');
        const { TargetingProcessor } = require('./TargetingProcessor');
        const player = state.players[playerId];
        const additionalCosts = ability.costs || [];

        // Sacrifice Cost
        const sacrificeCost = additionalCosts.find((cost: AbilityCost) => cost.type === 'Sacrifice');
        const hasChosenSacrifice = (state as any).lastChosenSacrificeId !== undefined;
        if (sacrificeCost && !hasChosenSacrifice) {
            const isSelfSac = sacrificeCost.targetMapping === 'SELF' || (sacrificeCost.restrictions || []).some((r: any) => typeof r === 'string' && r.toLowerCase() === 'self');
            const legalSacrificeIds = state.battlefield.filter(o => o.controllerId === playerId && TargetingProcessor.matchesRestrictions(state, o, sacrificeCost.restrictions || [], playerId, obj.id)).map(o => o.id);

            if (legalSacrificeIds.length === 0 && !isSelfSac) {
                log(`Illegal Activation: No valid objects to sacrifice for ${obj.definition.name}.`);
                return false;
            }

            if (isSelfSac) {
                (state as any).lastChosenSacrificeId = obj.id;
            } else if (legalSacrificeIds.length === 1) {
                (state as any).lastChosenSacrificeId = legalSacrificeIds[0];
            } else {
                state.pendingAction = {
                    type: ActionType.ModalSelection,
                    playerId: playerId,
                    sourceId: obj.id,
                    data: {
                        label: "Sacrifice a creature to activate " + obj.definition.name,
                        hideUndo: false,
                        isCostChoice: true,
                        costType: 'Sacrifice',
                        abilityIndex: abilityIndex,
                        declaredTargets: declaredTargets || [],
                        choices: legalSacrificeIds.map(id => {
                            const sObj = state.battlefield.find(o => o.id === id);
                            return { label: `Sacrifice ${sObj?.definition.name || id}`, value: id, cardData: sObj, selectable: true }
                        })
                    }
                };
                log(`[SACRIFICE] ${player.name} must choose an object to sacrifice to activate ${obj.definition.name}.`);
                return true;
            }
        }

        // Discard Cost
        const discardCost = additionalCosts.find((cost: AbilityCost) => (cost.type as string).toLowerCase() === 'discard');
        const hasChosenDiscard = (state as any).lastChosenDiscardId !== undefined;
        if (discardCost && !hasChosenDiscard) {
            const legalDiscardIds = player.hand.filter(c => TargetingProcessor.matchesRestrictions(state, c, discardCost.restrictions || [], playerId, obj.id)).map(c => c.id);
            if (legalDiscardIds.length === 0) {
                log(`Illegal Activation: No valid cards to discard for ${obj.definition.name}.`);
                return false;
            }
            state.pendingAction = {
                type: ActionType.ModalSelection,
                playerId: playerId,
                sourceId: obj.id,
                data: {
                    label: "Discard a card to activate " + obj.definition.name,
                    hideUndo: false,
                    isCostChoice: true,
                    costType: 'Discard',
                    abilityIndex: abilityIndex,
                    minChoices: 1,
                    maxChoices: 1,
                    declaredTargets: declaredTargets || [],
                    choices: legalDiscardIds.map(id => {
                        const c = player.hand.find(o => o.id === id)!;
                        return { label: `Discard ${c.definition.name}`, value: id, cardData: c, selectable: true }
                    })
                }
            };
            log(`[DISCARD] ${player.name} must choose a card to discard to activate ${obj.definition.name}.`);
            return true;
        }

        // TapSelection Cost
        const tapSelectionCost = additionalCosts.find((cost: AbilityCost) => cost.type === 'TapSelection');
        const hasChosenTapSelection = (state as any).lastChosenTapSelectionIds !== undefined;
        if (tapSelectionCost && !hasChosenTapSelection) {
            const legalTapIds = state.battlefield.filter(o => o.controllerId === playerId && !o.isTapped && TargetingProcessor.matchesRestrictions(state, o, tapSelectionCost.restrictions || [], playerId, obj.id)).map(o => o.id);
            const amount = Number(tapSelectionCost.value || tapSelectionCost.amount || 1);
            if (legalTapIds.length < amount) {
                log(`Illegal Activation: Not enough valid permanents to tap for ${obj.definition.name}.`);
                return false;
            }
            state.pendingAction = {
                type: ActionType.ModalSelection,
                playerId: playerId,
                sourceId: obj.id,
                data: {
                    label: `Tap ${amount} creatures to activate ` + obj.definition.name,
                    hideUndo: false,
                    isCostChoice: true,
                    costType: 'TapSelection',
                    abilityIndex: abilityIndex,
                    minChoices: amount,
                    maxChoices: amount,
                    declaredTargets: declaredTargets || [],
                    choices: legalTapIds.map(id => {
                        const sObj = state.battlefield.find(o => o.id === id);
                        return { label: `Tap ${sObj?.definition.name || id}`, value: id, cardData: sObj, selectable: true }
                    })
                }
            };
            log(`[TAP] ${player.name} must choose ${amount} objects to tap to activate ${obj.definition.name}.`);
            return true;
        }

        // Exile Cost
        const exileCost = additionalCosts.find((cost: AbilityCost) => cost.type === 'Exile');
        const hasChosenExile = (state as any).lastChosenExileIds !== undefined;
        if (exileCost && !hasChosenExile) {
            const zones = exileCost.sourceZones || (exileCost.sourceZone ? [exileCost.sourceZone] : [Zone.Battlefield]);
            const pool = zones.flatMap((z: any) => {
                if (z === Zone.Battlefield) return state.battlefield.filter((o: GameObject) => o.controllerId === playerId);
                if (z === Zone.Graveyard) return player.graveyard;
                if (z === Zone.Hand) return player.hand;
                if (z === Zone.Exile) return state.exile;
                if (z === Zone.Library) return player.library;
                return [];
            });
            const legalExileIds = pool.filter((o: GameObject) => TargetingProcessor.matchesRestrictions(state, o, exileCost.restrictions || [], playerId, obj.id)).map((o: GameObject) => o.id);
            if (legalExileIds.length === 0) {
                log(`Illegal Activation: No valid cards to exile for ${obj.definition.name}.`);
                return false;
            }
            state.pendingAction = {
                type: ActionType.ModalSelection,
                playerId: playerId,
                sourceId: obj.id,
                data: {
                    label: "Exile a card to activate " + obj.definition.name,
                    hideUndo: false,
                    isCostChoice: true,
                    costType: 'Exile',
                    abilityIndex: abilityIndex,
                    minChoices: 1,
                    maxChoices: 1,
                    declaredTargets: declaredTargets || [],
                    choices: legalExileIds.map((id: string) => {
                        const c = pool.find((o: GameObject) => o.id === id)!;
                        return { label: `Exile ${c.definition.name}`, value: id, cardData: c, selectable: true }
                    })
                }
            };
            log(`[EXILE] ${player.name} must choose a card to exile to activate ${obj.definition.name}.`);
            return true;
        }

        return null;
    }

    private static handleAbilityTargeting(state: GameState, playerId: PlayerId, cardId: string, obj: GameObject, ability: any, abilityIndex: number, log: (m: string) => void, engine: any, preSelectedChoice?: number): boolean {
        const { TargetingProcessor } = require('./TargetingProcessor');
        const pool = [
            ...Object.keys(state.players),
            ...state.battlefield.map(o => o.id),
            ...Object.values(state.players).flatMap(p => p.graveyard.map(c => c.id)),
            ...state.exile.map(o => o.id),
            ...state.stack.map(o => o.id)
        ];
        const firstDef = TargetingProcessor.getDefinitionForIndex(ability.targetDefinition, 0);
        const legalForFirst = pool.filter(tid => TargetingProcessor.isLegalTarget(state, obj, tid, ability.targetDefinition, 0));

        const firstType = (firstDef.type || '').toLowerCase();
        const firstRestrictions = (firstDef.restrictions || []).map((r: any) => typeof r === 'string' ? r.toLowerCase() : r);
        const isOpponentTarget = firstType === 'opponent' || (firstType === 'player' && firstRestrictions.includes('opponent'));

        const isSingleOpponentTarget = isOpponentTarget &&
            legalForFirst.length === 1;

        const { maxCount, minCount, count } = TargetingProcessor.calculateTotalCounts(ability.targetDefinition, (obj as any).xValue || 0);

        if (isSingleOpponentTarget) {
            const opponentId = legalForFirst[0];
            log(`[AUTO-TARGET] Automatically targeting the only opponent for ${obj.definition.name}.`);

            if (maxCount === 1) {
                return this.finalizeAbilityActivation(state, playerId, obj, ability, abilityIndex, [opponentId], log, engine, preSelectedChoice);
            }

            const autoSelected = [opponentId];
            const nextIndex = autoSelected.length;
            const nextDef = TargetingProcessor.getDefinitionForIndex(ability.targetDefinition, nextIndex);
            const prompt = TargetingProcessor.generateTargetPrompt(ability.targetDefinition, nextIndex, (obj as any).xValue || 0, false);

            state.pendingAction = {
                type: 'TARGETING',
                playerId: playerId,
                sourceId: obj.id,
                data: {
                    abilityIndex: abilityIndex,
                    targetDefinition: ability.targetDefinition,
                    targets: pool.filter(tid => TargetingProcessor.isLegalTarget(state, obj, tid, ability.targetDefinition, nextIndex)),
                    selectedTargets: autoSelected,
                    label: nextDef.label,
                    xValue: (obj as any).xValue,
                    maxCount,
                    minCount,
                    count,
                    prompt,
                    preSelectedChoice
                }
            };
            return true;
        }

        if (legalForFirst.length === 0) {
            if (firstDef.optional || firstDef.minCount === 0) {
                log(`No legal targets found, skipping.`);
                return this.finalizeAbilityActivation(state, playerId, obj, ability, abilityIndex, [], log, engine, preSelectedChoice);
            } else {
                log(`Illegal Play: No valid targets available for ${obj.definition.name}'s ability.`);
                return false;
            }
        }

        const prompt = TargetingProcessor.generateTargetPrompt(ability.targetDefinition, 0, (obj as any).xValue || 0, false);
        state.pendingAction = {
            type: 'TARGETING',
            playerId: playerId,
            sourceId: obj.id,
            data: {
                abilityIndex: abilityIndex,
                targetDefinition: ability.targetDefinition,
                targets: legalForFirst,
                maxCount,
                minCount,
                count,
                prompt
            }
        };
        log(`[TARGETING] Player must choose targets for ${obj.definition.name}'s ability.`);
        return true;
    }

    private static finalizeAbilityActivation(state: GameState, playerId: PlayerId, obj: GameObject, ability: any, abilityIndex: number, declaredTargets: string[], log: (m: string) => void, engine: any, preSelectedChoice?: number): boolean {
        const { AbilityType } = require('@shared/engine_types');
        const { TriggerProcessor } = require('./../effects/TriggerProcessor');
        const playerObj = state.players[playerId];

        const stackId = `ability_${Date.now()}`;
        // ARCHITECTURAL NOTE: Choice Propagation (Egress)
        // If the auto-tap engine pre-calculated a choice (e.g. which color a dual land produced),
        // it is passed here so ChoiceEffectHandler can skip the UI modal.
        const stackObj = {

            id: stackId,
            controllerId: playerId,
            sourceId: obj.id,
            type: AbilityType.Activated,
            name: `${obj.definition.name} Ability`,
            image_url: obj.definition.image_url,
            targets: declaredTargets,
            abilityIndex: abilityIndex,
            xValue: (obj as any).xValue,
            card: obj,
            definition: obj.definition,
            preSelectedChoice: preSelectedChoice,
            data: {
                effects: (ability as any).effects || [],
                targetDefinition: ability.targetDefinition
            }
        };

        // Mana Payment
        const manaCost = (ability.costs || []).find((cost: AbilityCost) => cost.type === 'Mana');
        if (manaCost) {
            const effectiveMana = CostProcessor.getEffectiveManaCost(state, manaCost, obj, stackObj);
            if (!ManaProcessor.canPayManaCost(playerObj, effectiveMana, state)) {
                if (ManaProcessor.canPayWithTotal(playerObj, state.battlefield, effectiveMana)) {
                    log(`Auto-tapping lands to pay ability cost ${effectiveMana}...`);
                    ManaProcessor.autoTapLandsForCost(state, playerId, effectiveMana, log, engine.tapForMana);
                }
            }
        }

        CostProcessor.pay(state, ability.costs || [], obj.id, playerId, (m) => log(m));

        // Clean up choice flags
        delete (state as any).lastChosenSacrificeId;
        delete (state as any).lastChosenDiscardId;

        obj.abilitiesUsedThisTurn++;
        if (ability.limitPerTurn) {
            const usageKey = `ability_${obj.id}_${abilityIndex}`;
            state.turnState.triggeredAbilitiesUsedThisTurn[usageKey] = (state.turnState.triggeredAbilitiesUsedThisTurn[usageKey] || 0) + 1;
        }

        if (ability.isManaAbility) {
            const { EffectProcessor } = require('../effects/EffectProcessor');
            (ability as any).effects.forEach((eff: any) => {
                EffectProcessor.executeEffect(state, eff, obj.id, [], (m: string) => log(m), stackObj, null);
            });
            log(`Activated mana ability of ${obj.definition.name}`);
            return true;
        }

        state.stack.push(stackObj);
        log(`Activated ability of ${obj.definition.name}: ${ability.id}`);

        declaredTargets.forEach(tid => {
            TriggerProcessor.onEvent(state, { type: 'ON_BECOME_TARGET', playerId, targetId: tid, data: { sourceId: stackId, sourceCard: obj } }, log);
        });

        state.consecutivePasses = 0;
        engine.passPriority(playerId);
        return true;
    }
}
