import {
  GameState,
  ConditionType,
  ConditionContext,
} from "@shared/engine_types";

export class ConditionProcessor {
  /**
   * Evaluates a complex condition string or logic function.
   * Supports:
   * - Recursive logic: "IS_YOUR_TURN && (HAS_PERMANENT:creature || !GAINED_LIFE_THIS_TURN)"
   * - Parameterized tokens: "HAS_PERMANENT:creature,power>=4"
   * - Registry-based handlers for modular logic.
   */
  public static matchesCondition(
    state: GameState,
    condition: ConditionType | undefined,
    context: ConditionContext,
  ): boolean {
    if (!condition) return true;

    // 1. Support for function-based conditions
    if (typeof condition === "function") {
      return (condition as any)(state, context.event, context);
    }

    if (typeof condition !== "string") return true;

    // --- RECURSIVE LOGICAL PARSER (Supports parentheses, &&, ||, !) ---
    
    // 2. Handle Parentheses
    if (condition.includes("(")) {
      let result = condition;
      while (result.includes("(")) {
        const lastOpen = result.lastIndexOf("(");
        const nextClose = result.indexOf(")", lastOpen);
        if (nextClose === -1) break; // Malformed

        const subExpr = result.substring(lastOpen + 1, nextClose);
        const subRes = this.matchesCondition(state, subExpr, context);
        result =
          result.substring(0, lastOpen) +
          (subRes ? "TRUE_VAL" : "FALSE_VAL") +
          result.substring(nextClose + 1);
      }
      return this.matchesCondition(state, result, context);
    }

    // 3. Handle OR (||) - lowest precedence
    if (condition.includes("||")) {
      return condition
        .split("||")
        .some((c) => this.matchesCondition(state, c.trim(), context));
    }

    // 4. Handle AND (&&)
    if (condition.includes("&&")) {
      return condition
        .split("&&")
        .every((c) => this.matchesCondition(state, c.trim(), context));
    }

    // 5. Handle Placeholder results from parentheses reduction
    const trimmed = condition.trim();
    if (trimmed === "TRUE_VAL") return true;
    if (trimmed === "FALSE_VAL") return false;

    // 6. Handle Negation (!)
    if (trimmed.startsWith("!")) {
      return !this.matchesCondition(
        state,
        trimmed.substring(1),
        context,
      );
    }

    // --- REGISTRY-BASED EVALUATION ---
    
    // 7. Extract token and parameters (e.g., "HAS_PERMANENT:creature" -> token: "HAS_PERMANENT", params: ["creature"])
    let token = trimmed;
    let params: string[] = [];
    
    if (trimmed.includes(":")) {
        const firstColon = trimmed.indexOf(":");
        token = trimmed.substring(0, firstColon);
        const rest = trimmed.substring(firstColon + 1);
        params = rest.split(",").map(p => p.trim());
    }

    const { ConditionRegistry } = require("./ConditionRegistry");
    const handler = ConditionRegistry[token] || ConditionRegistry[token.toUpperCase()];

    if (handler) {
        try {
            return handler.matches(state, params, context);
        } catch (e) {
            console.error(`[ConditionProcessor] Error evaluating condition "${token}":`, e);
            return false;
        }
    }

    // Fallback for unhandled strings (default to true to avoid breaking legacy logic silently, 
    // but log a warning if possible)
    if (trimmed && !["TRUE_VAL", "FALSE_VAL"].includes(trimmed)) {
        // console.warn(`[ConditionProcessor] Unhandled condition token: "${token}"`);
    }
    
    return true;
  }
}
