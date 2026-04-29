import {
    ActionResult, GameObject,
    GameState,
    PlayerId,
    Zone
} from "@shared/engine_types";

/**
 * Rules Engine Module: Replacement Effects (Rule 614)
 * Handles "If... instead" logic, diverting events before they happen.
 */
export class ReplacementProcessor {
    /**
     * CR 614.1: Standardized entry point for zone movement replacements.
     * Evaluates all applicable replacement effects and returns the final destination.
     */
    public static handleMovementReplacement(
        state: GameState,
        card: GameObject,
        destination: Zone,
        options: {
            fromZone: Zone;
            isDraw: boolean;
            isDiscard: boolean;
            targetPlayerId: PlayerId;
        },
        log: (m: string) => void
    ): { destination: Zone; replaced: boolean; actionResult?: ActionResult } {
        const { fromZone, isDraw, isDiscard, targetPlayerId } = options;
        let finalDestination = destination;
        let replaced = false;

        // 1. RULE 614.5: Continuous Effects (Exile on move, etc.)
        if (finalDestination === Zone.Graveyard) {
            const hasExileReplacement = state.ruleRegistry.continuousEffects.some(
                (e) =>
                    e.exileOnMoveToGraveyard &&
                    (e.targetIds?.includes(card.id) ||
                        (e.targetMapping === "CONTROLLER" &&
                            e.controllerId === card.controllerId))
            );
            if (hasExileReplacement) {
                log(`[REPLACED] ${card.definition.name} is exiled instead of graveyard due to continuous effect.`);
                finalDestination = Zone.Exile;
                replaced = true;
            }
        }

        // 2. RULE 702.34a: Flashback
        if (fromZone === Zone.Stack && finalDestination !== Zone.Exile && card.isFlashbackCast) {
            log(`[FLASHBACK] ${card.definition.name} was cast via flashback and is being exiled instead of moving to ${finalDestination}.`);
            finalDestination = Zone.Exile;
            replaced = true;
        }

        // 3. RULE 614/121.6: Draw Replacement (Modular)
        if (
            isDraw &&
            fromZone === Zone.Library &&
            finalDestination === Zone.Hand &&
            !state.isResolvingDrawReplacement
        ) {
            const result = this.handleDrawReplacements(state, card, targetPlayerId, log);
            if (result) return result;
        }

        // 4. RULE 614: Entry Replacements (Containment Priest, etc.)
        if (finalDestination === Zone.Battlefield && state.ruleRegistry.replacementEffects) {
            const result = this.handleEntryReplacements(state, card, fromZone, log);
            if (result) finalDestination = result;
        }

        return { destination: finalDestination, replaced };
    }

    /**
     * CR 121.6: If a replacement effect replaces a draw, the original draw never happened.
     */
    private static handleDrawReplacements(
        state: GameState,
        card: GameObject,
        playerId: PlayerId,
        log: (m: string) => void
    ): any {
        const registry = state.ruleRegistry;
        if (!registry.replacementEffects) return null;

        for (const replacement of registry.replacementEffects) {
            // Teferi's Ageless Insight Logic
            if (replacement.id.includes("teferi_ageless_insight")) {
                const isYourTurn = state.activePlayerId === playerId;
                const isYourDrawStep = isYourTurn && state.currentStep === "Draw";
                const cardsDrawn = state.turnState.cardsDrawnThisTurn[playerId] || 0;
                const skipFirstDrawInDrawStep = isYourDrawStep && cardsDrawn === 0;

                if (!skipFirstDrawInDrawStep) {
                    log(`[REPLACED] Teferi's Ageless Insight replaces draw with 2 draws.`);
                    state.isResolvingDrawReplacement = true;

                    const { ActionProcessor } = require("../../actions/ActionProcessor");
                    // Perform the double draw sequence
                    ActionProcessor.moveCard(state, card, Zone.Hand, playerId, log, "top", true);

                    const player = state.players[playerId];
                    if (player && player.library.length > 0) {
                        const nextCard = player.library.pop()!;
                        ActionProcessor.moveCard(state, nextCard, Zone.Hand, playerId, log, "top", true);
                    }

                    state.isResolvingDrawReplacement = false;
                    return {
                        destination: Zone.Hand,
                        replaced: true,
                        actionResult: {
                            success: true,
                            affectedIds: [card.id],
                            actualAmount: 1,
                            metadata: { replaced: true }
                        }
                    };
                }
            }
        }
        return null;
    }

    private static handleEntryReplacements(
        state: GameState,
        card: GameObject,
        fromZone: Zone,
        log: (m: string) => void
    ): Zone | null {
        const isToken = (card as any).isToken || card.id.startsWith("token_");
        const types = card.definition.types.map((t) => t.toLowerCase());

        for (const replacement of state.ruleRegistry.replacementEffects || []) {
            const source = state.battlefield.find((o) => o.id === replacement.sourceId);
            if (!source || source.isPhasedOut) continue;

            // Containment Priest Case
            if (replacement.id.toLowerCase().includes("containment_priest")) {
                if (types.includes("creature") && !isToken && fromZone !== Zone.Stack) {
                    log(`[REPLACED] ${source.definition.name} exiles ${card.definition.name} (not cast).`);
                    return Zone.Exile;
                }
            }
        }
        return null;
    }
}
