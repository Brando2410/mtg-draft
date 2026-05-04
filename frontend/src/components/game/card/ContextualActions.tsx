import { memo } from 'react';

interface ContextualActionsProps {
  pendingAction: any;
  objId: string;
  onChoice: (choice: string) => void;
}

export const ContextualActions = memo(({ pendingAction, objId, onChoice }: ContextualActionsProps) => {
  if (!pendingAction?.data?.isContextual || pendingAction.sourceId !== objId) return null;

  return (
    <>
      {/* Click-away overlay */}
      <div
        className="fixed inset-0 z-[290] cursor-default"
        onClick={(e) => {
          e.stopPropagation();
          const cancelIdx = pendingAction.data.choices.findIndex((c: any) =>
            c.value === 'none' ||
            c.label.toLowerCase().includes('cancel') ||
            c.label.toLowerCase().includes('none')
          );
          if (cancelIdx !== -1) onChoice(`CHOICE_${cancelIdx}`);
        }}
      />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-[1vh] z-[300] flex flex-col gap-[0.5vh] w-[calc(var(--u)*18)] animate-in slide-in-from-bottom-2 fade-in duration-200">
        {pendingAction.data.choices.map((choice: any, idx: number) => {
          const isCancel = choice.value === 'none' ||
            choice.label.toLowerCase().includes('cancel') ||
            choice.label.toLowerCase().includes('none');

          if (isCancel) return null;

          return (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                onChoice(`CHOICE_${idx}`);
              }}
              className="w-full py-[1vh] px-[1.5vh] rounded-lg font-black text-[calc(var(--u)*1.1)] uppercase tracking-tighter shadow-2xl border-2 transition-all active:scale-95 bg-indigo-600/95 border-indigo-400 text-white hover:bg-indigo-500 hover:scale-105 shadow-indigo-500/20 shadow-lg"
            >
              {choice.label}
            </button>
          );
        })}
      </div>
    </>
  );
});
