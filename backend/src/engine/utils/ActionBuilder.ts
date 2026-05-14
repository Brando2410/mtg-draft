import {
    ActionType,
    PendingAction,
    PlayerId,
    InteractionMetadata,
    ChoiceOption,
    GameObject,
    EngineFrame,
    TargetDefinition,
    ActionData
} from '@shared/engine_types';
import { TRANSIENT_FIELDS } from '@shared/utils/ActionUtils';

/**
 * ActionBuilder: A fluent utility to reduce boilerplate and enforce 
 * the metadata-first architecture for PendingAction modals.
 */
export class ActionBuilder {
    private action: PendingAction;

    private constructor(type: ActionType, playerId: PlayerId, sourceId: string) {
        this.action = {
            type: type as string,
            playerId,
            sourceId,
            data: {
                label: '',
                metadata: {}
            }
        };
    }

    public static fromType(type: ActionType | string, playerId: PlayerId, sourceId: string): ActionBuilder {
        return new ActionBuilder(type as ActionType, playerId, sourceId);
    }

    public static modal(playerId: PlayerId, sourceId: string, label: string): ActionBuilder {
        const builder = new ActionBuilder(ActionType.ModalSelection, playerId, sourceId);
        builder.action.data!.label = label;
        return builder;
    }

    public static targeting(playerId: PlayerId, sourceId: string, label: string): ActionBuilder {
        const builder = new ActionBuilder(ActionType.Targeting, playerId, sourceId);
        builder.action.data!.label = label;
        return builder;
    }

    public static choice(playerId: PlayerId, sourceId: string, label: string): ActionBuilder {
        const builder = new ActionBuilder(ActionType.Choice, playerId, sourceId);
        builder.action.data!.label = label;
        return builder;
    }

    public static chooseX(playerId: PlayerId, sourceId: string, label: string): ActionBuilder {
        const builder = new ActionBuilder(ActionType.ChooseX, playerId, sourceId);
        builder.action.data!.label = label;
        (builder.action.data! as any).isResolutionX = false;
        return builder;
    }

    public static confirmAutoTap(playerId: PlayerId, sourceId: string, label: string): ActionBuilder {
        const builder = new ActionBuilder(ActionType.ConfirmAutoTap, playerId, sourceId);
        builder.action.data!.label = label;
        return builder;
    }

    /**
     * Ingests a raw data object, automatically moving transient fields to metadata
     * and pruning them from the root. This is the "Magic Sauce" for boilerplate reduction.
     * 
     * Input is typed as a composite of ActionData and InteractionMetadata to 
     * provide better IDE support and reduce 'any' usage.
     */
    public ingest(data: Partial<ActionData> & Partial<InteractionMetadata> & Record<string, unknown>): this {
        if (!data) return this;

        // Start with a merge. We cast to any here because ActionData is a strict union,
        // but the ingestion pattern specifically handles mixing these properties.
        const dataRoot = this.action.data! as any;
        Object.assign(dataRoot, data);

        const metadata: InteractionMetadata = dataRoot.metadata || {};

        // Move transient fields from root to metadata container
        TRANSIENT_FIELDS.forEach(field => {
            if (dataRoot[field] !== undefined) {
                metadata[field] = dataRoot[field];
                delete dataRoot[field];
            }
        });

        dataRoot.metadata = metadata;

        // Ensure label is preserved if it was in ingested data (ActionData.label is required)
        if (data.label) dataRoot.label = data.label;

        return this;
    }

    public withMetadata(meta: InteractionMetadata): this {
        this.action.data!.metadata = { ...this.action.data!.metadata, ...meta };
        return this;
    }

    public withContext(context: {
        parentContext?: EngineFrame,
        isFreeCast?: boolean,
        isMiracleCast?: boolean,
        exileOnResolution?: boolean,
        stackObj?: any,
        abilityIndex?: number,
        isSpellCasting?: boolean,
        effectIndex?: number,
        controllerId?: PlayerId
    }): this {
        this.action.data!.metadata = {
            ...this.action.data!.metadata,
            ...context
        };
        return this;
    }

    public withChoices(choices: ChoiceOption[], min = 1, max = 1): this {
        this.action.data!.choices = choices;
        this.action.data!.minChoices = min;
        this.action.data!.maxChoices = max;
        return this;
    }

    public withTargeting(defs: TargetDefinition[] | TargetDefinition): this {
        this.action.data!.targetDefinitions = Array.isArray(defs) ? defs : [defs];
        return this;
    }

    public asCost(costType: string): this {
        this.action.data!.isCostChoice = true;
        this.action.data!.costType = costType;
        return this;
    }

    public withData(data: Partial<ActionData>): this {
        const label = data.label || this.action.data!.label;
        this.action.data = { ...this.action.data!, ...data, label };
        return this;
    }

    public build(): PendingAction {
        return this.action;
    }
}
