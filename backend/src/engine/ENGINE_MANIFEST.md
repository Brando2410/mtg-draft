# MTG Engine Technical Manifest v2.0
**Status:** Canonical Reference | **Target:** Antigravity / Engine Developers

---

## 📂 1. Directory Blueprint
| System | Directory Path | Primary Logic Source |
| :--- | :--- | :--- |
| **Orchestration** | `backend/src/engine/` | `GameEngine.ts` |
| **Handled Effects**| `backend/src/engine/modules/effects/handlers/` | `EffectProcessor.ts` |
| **Physical Actions**| `backend/src/engine/modules/actions/` | `ActionProcessor.ts`, `SpellProcessor.ts` |
| **Game State** | `backend/src/engine/modules/state/` | `LayerProcessor.ts`, `StateBasedActionsProcessor.ts` |
| **Core Rules** | `backend/src/engine/modules/core/` | `PriorityProcessor.ts`, `RegistryProcessor.ts`, `StackResolver.ts` |
| **Definitions** | `backend/src/engine/data/m21/` | `m21_logic.ts`, individual card files |

---

## 🏛️ 2. The Golden Rules (Invariants)
*   **Draw (CR 121) vs. Look-and-Put:** `ON_DRAW` triggers MUST ONLY fire if `isDraw: true` is set in `moveCard`. This flag is globally managed by `EffectProcessor` using the `DrawCards` keyword.
*   **Object Identity (CR 400.7):** Zone transitions = New Object. Always call `resetObjectState`. The only exception is Battlefield attachments (Aura/Equipment moves).
*   **Resolution Cycle (CR 608):** A spell card stays on the Stack until the **LAST** effect in its definition finishes resolving. It is moved to the Grave/Exile as the final step of `resolveEffects`.
*   **Layer Recalculation:** Never trust `power` or `toughness` properties directly in logic. Always use `LayerProcessor.getEffectiveStats(obj, state)` to account for static effects.

---

## ⚙️ 3. Execution Pipeline
### The Priority Loop (The "Infinite" Machine)
1. `GameEngine.passPriority` -> `PriorityProcessor` tracks passes.
2. If `consecutivePasses === 2`:
   - If `stack.length > 0`: `StackResolver.resolveTop` -> `EffectProcessor`.
   - If `stack.length === 0`: `TurnProcessor.advanceStep`.
3. After every change, `StateBasedActionsProcessor` cleans up 0-toughness creatures and checks for lethal damage.

### The Whiteboard (Abilities & Effects)
The `ruleRegistry` is a global collection of "Listening Logic":
*   **Replacement Effects:** Run *before* an action happens to divert it (e.g., *Teferi's Ageless Insight*).
*   **Continuous Effects:** Stored modifiers applied by `LayerProcessor`.
*   **Triggered Abilities:** Background listeners that fire `onEvent`.

---

## 🚦 4. Contextual Objects
When resolving effects, you must carry these payloads:
*   `stackObject`: The physical item on the stack (Spell/Ability).
*   `stackObject.data.targets`: Validated target IDs selected during casting.
*   `parentContext`: A scratchpad for multi-step resolution (e.g., "Choose a card... then do something to IT").

---

## 🛠️ 5. Troubleshooting Flags
*   `(state as any).isResolvingDrawReplacement`: Prevents infinite loops when a draw-replacement effect draws more cards.
*   `card.lastNonStackZone`: Crucial for triggers like "If you cast this spell from your hand."
*   `state.turnState.cardsDrawnThisTurn`: Used to track "Second draw" triggers (*Jolrael*).
