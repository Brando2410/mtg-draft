import { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Code, MessageSquare, Clock } from 'lucide-react';

interface LogicComparisonModalProps {
  card: any;
  onClose: () => void;
  onUpdateStatus: (status: 'VERIFIED' | 'TO_CHECK' | 'PATCHED' | 'RE_CHECK', note: string) => void;
}

export const LogicComparisonModal = ({ card, onClose, onUpdateStatus }: LogicComparisonModalProps) => {
  const [note, setNote] = useState(card.note || '');
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    setNote(card.note || '');
  }, [card]);

  const handleSave = (status: 'VERIFIED' | 'TO_CHECK' | 'PATCHED' | 'RE_CHECK') => {
    onUpdateStatus(status, note);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'ORACLE': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'LOGIC': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'ENGINE': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
        
        {/* HEADER */}
        <div className="flex items-center justify-between p-8 border-b border-white/5">
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                <Code className="w-8 h-8 text-indigo-400" />
             </div>
             <div>
                <div className="flex items-center gap-3">
                    <h3 className="text-3xl font-black text-white uppercase tracking-tight italic">{card.name}</h3>
                    {card.category && (
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getCategoryColor(card.category)}`}>
                            {card.category} ISSUE
                        </span>
                    )}
                </div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 mt-1">
                   Quality Audit & Logic Consistency Check
                   {card.lastUpdated && (
                      <span className="flex items-center gap-1 opacity-50 border-l border-white/10 pl-2">
                         <Clock className="w-3 h-3" />
                         Updated: {new Date(card.lastUpdated).toLocaleString()}
                      </span>
                   )}
                </p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="p-4 bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white rounded-2xl transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* LEFT: SCAYFALL / ORACLE */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
               <h4 className="text-indigo-400 font-black uppercase text-xs tracking-[0.2em]">Official Scryfall Oracle</h4>
               <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-[10px] font-black text-indigo-400 uppercase tracking-widest italic">Source of Truth</span>
            </div>
            
            <div className="bg-slate-950/50 p-8 rounded-3xl border border-white/5 space-y-6">
               <div className="flex justify-between items-center text-sm font-bold text-white">
                  <span>Mana Cost:</span>
                  <span className="text-indigo-400">{card.manaCost || (card.definition?.manaCost) || '---'}</span>
               </div>
               <div className="flex justify-between items-center text-sm font-bold text-white font-mono opacity-60">
                  <span>Type Line:</span>
                  <span>{card.type_line || card.typeLine || card.definition?.type_line}</span>
               </div>
               
               <div className="space-y-3 pt-4 border-t border-white/5">
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block">Official Text</span>
                  <div className="text-lg font-medium text-slate-300 leading-relaxed italic pr-4">
                    {card.oracleText || 'Nessun testo oracle presente.'}
                  </div>
               </div>
            </div>
          </div>

          {/* RIGHT: ENGINE LOGIC */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
               <h4 className="text-emerald-400 font-black uppercase text-xs tracking-[0.2em]">Engine Logic Definition</h4>
               <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${card.engineStatus === 'IMPLEMENTED' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'}`}>
                  {card.engineStatus}
               </span>
            </div>

            <div className="bg-slate-950/50 p-8 rounded-3xl border border-emerald-500/10 space-y-6">
               <div className="space-y-3">
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block">Reconstructed Logic (Reverse Oracle)</span>
                  <div className="text-lg font-medium text-emerald-100/80 leading-relaxed">
                    {card.reconstructedText || (card.engineStatus === 'DATA_ONLY' ? 'Nessuna logica definita.' : 'Logica parziale.')}
                  </div>
               </div>

               <div className="space-y-4 pt-6 border-t border-white/5">
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest block flex items-center gap-2">
                        <MessageSquare className="w-3 h-3" />
                        Audit Notes & Issue Analysis
                     </span>
                     {(card.logicRaw || card.logicSnapshot) && (
                        <button 
                          onClick={() => setShowCode(!showCode)}
                          className={`flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-all ${showCode ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                        >
                           <Code className="w-3 h-3" />
                           {showCode ? 'Hide RAW JSON' : 'View RAW JSON'}
                        </button>
                      )}
                  </div>
                  
                  <textarea 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Describe the problem or fix details..."
                    className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 text-sm text-slate-300 outline-none focus:border-indigo-500/50 transition-all min-h-[140px] resize-none"
                  />

                  {showCode && (card.logicRaw || card.logicSnapshot) && (
                     <div className="animate-in slide-in-from-top-2 duration-300">
                        <pre className="text-[10px] bg-slate-950 p-6 rounded-2xl border border-white/10 text-emerald-400/80 font-mono overflow-x-auto max-h-60 shadow-inner">
                           {JSON.stringify(card.logicRaw || card.logicSnapshot, null, 2)}
                        </pre>
                     </div>
                  )}
               </div>
            </div>
          </div>
        </div>

        {/* FOOTER: VERIFICATION STATUS */}
        <div className="p-8 bg-slate-950/80 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6 backdrop-blur-md">
            <div className="flex flex-col gap-1">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Decisione Stato</span>
               <p className="text-slate-300 text-sm font-bold">Finalizza la validazione della carta</p>
            </div>

            <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-white/5 gap-2">
                <button 
                  onClick={() => handleSave('TO_CHECK')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${card.manualStatus === 'TO_CHECK' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:bg-amber-600/10 hover:text-amber-400'}`}
                >
                  <AlertCircle className="w-4 h-4" />
                  Da Verificare
                </button>
                
                <div className="w-px h-8 bg-white/5 mx-1 translate-y-2" />

                <button 
                  onClick={() => handleSave('VERIFIED')}
                  className={`flex items-center gap-2 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${card.manualStatus === 'VERIFIED' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Verifica Completata
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};
