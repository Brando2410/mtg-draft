import { memo } from 'react';

interface ManaChoiceToggleViewProps {
    hybridGroups: any[];
    toggleState: Record<number, string>;
    setToggleState: (state: Record<number, string>) => void;
}

export const ManaChoiceToggleView = memo(({
    hybridGroups,
    toggleState,
    setToggleState
}: ManaChoiceToggleViewProps) => {

    const handleToggle = (groupIndex: number, option: string) => {
        setToggleState({
            ...toggleState,
            [groupIndex]: option
        });
    };

    return (
        <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto py-8">
            <h4 className="text-white/60 text-sm font-black uppercase tracking-[0.3em] text-center mb-2">Toggle Payment Options</h4>
            <div className="flex flex-wrap justify-center gap-8">
                {hybridGroups.map((group, gIdx) => (
                    <div key={`hybrid-group-${gIdx}`} className="flex flex-col items-center gap-4 p-6 bg-black/40 border border-white/5 rounded-[2rem] shadow-xl">
                        <div className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-1">
                            Symbol {gIdx + 1}
                        </div>
                        <div className="flex items-center gap-3 bg-black/60 p-2 rounded-full border border-white/10 relative overflow-hidden">
                            {group.options.map((opt: string) => {
                                const isSelected = toggleState[gIdx] === opt;
                                const isGeneric = !isNaN(parseInt(opt));
                                const label = isGeneric ? opt : opt;
                                
                                return (
                                    <button
                                        key={`toggle-${gIdx}-${opt}`}
                                        onClick={() => handleToggle(gIdx, opt)}
                                        className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl transition-all duration-300 z-10 ${
                                            isSelected 
                                            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] scale-105 border-2 border-white/20' 
                                            : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/80 border border-transparent'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});
