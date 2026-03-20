import { Users, Info, Play, X, Copy, CheckCircle2, Loader2, UserX, Pencil } from 'lucide-react';
import { useState } from 'react';
import { PLAYER_ID } from '../App';

interface Player {
  id: string;
  playerId: string;
  name: string;
  avatar?: string;
  online?: boolean;
}

const AVATARS = [
  'ajani.png', 'alena_halana.png', 'angrath.png', 'aragorn.png', 'ashiok.png',
  'astarion.png', 'atraxa.png', 'aurelia.png', 'basri.png', 'baylen.png',
  'beckett.png', 'borborygmos.png', 'braids.png', 'chandra.png', 'cruelclaw.png',
  'davriel.png', 'dina.png', 'domri.png', 'dovin.png', 'elesh_norn.png'
];

interface DraftLobbyProps {
  roomCode: string;
  players: Player[];
  rules: any;
  isHost: boolean;
  onStart: () => void;
  onClose?: () => void;
  onKick: (playerId: string) => void;
  onChangeAvatar: (avatar: string) => void;

}

export const DraftLobby = ({ 
  roomCode, 
  players, 
  rules, 
  isHost, 
  onStart, 
  onClose,
  onKick,
  onChangeAvatar
}: DraftLobbyProps) => {
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const me = players.find(p => p.playerId === PLAYER_ID);
  const targetPlayers = rules.playerCount || 8;
  const currentPlayers = players.length;


  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const takenAvatars = players.map(p => p.avatar).filter(Boolean) as string[];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col p-6 sm:p-16 overflow-y-auto lg:overflow-hidden custom-scrollbar">
      
      {/* Background with Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-purple-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-[20%] w-[50%] h-[30%] bg-emerald-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative flex-1 flex flex-col max-w-7xl mx-auto w-full">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-10 mb-8 lg:mb-20">
           <div className="flex items-center gap-10 group/header">
              <div 
                className="relative w-28 h-28 bg-slate-900 rounded-[3rem] border-2 border-indigo-500/20 flex items-center justify-center text-indigo-500 shadow-2xl overflow-visible shadow-indigo-500/10"
              >
                <Users className="w-12 h-12 opacity-40" />
                
                {/* Lobby Badge Floating */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl border border-indigo-400 z-50 whitespace-nowrap leading-none flex items-center">
                  Lobby
                </div>
              </div>
              <div className="space-y-2">
                 <h1 className="text-5xl sm:text-6xl font-black text-white uppercase italic tracking-tighter leading-none transition-all duration-500">
                    Stanza <span className="text-indigo-500">Draft</span>
                 </h1>
                 <p className="text-[10px] sm:text-[11px] text-slate-500 font-bold uppercase tracking-[0.4em] ml-1 flex items-center gap-2 flex-wrap">
                    {rules.cubeName || 'Il mio Cubo Personalizzato'} 
                    <span className="hidden sm:inline-flex items-center gap-2">
                       <span className="w-1.5 h-1.5 bg-slate-700 rounded-full" /> {targetPlayers} Giocatori richiesti
                    </span>
                 </p>
              </div>
           </div>

           {/* Room Code Card */}
           <div className="w-full lg:w-[400px] bg-slate-900/50 border border-white/5 rounded-[3rem] p-6 flex items-center justify-between shadow-2xl backdrop-blur-xl group/code">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 opacity-50">Codice Accesso</span>
                <span className="text-4xl font-black text-white tracking-[0.3em] font-mono italic pr-1">{roomCode}</span>
              </div>
              <button 
                onClick={handleCopy}
                className="w-16 h-16 rounded-[1.5rem] bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-white/10 transition-all flex items-center justify-center active:scale-90 shadow-xl"
              >
                {copied ? <CheckCircle2 className="w-7 h-7 text-emerald-500" /> : <Copy className="w-7 h-7" />}
              </button>
           </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-12 overflow-visible lg:overflow-hidden pb-8">
          
          {/* Players List Section */}
          <div className="lg:col-span-8 space-y-6 flex flex-col min-h-0">
            <div className="flex justify-between items-center px-6">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.4em]">Giocatori Connessi</h3>
              <div className="text-[11px] font-black text-indigo-500 bg-indigo-500/10 px-4 py-1.5 rounded-full">{currentPlayers} / {targetPlayers}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 overflow-y-auto pr-2 custom-scrollbar content-start">
               {/* Player Cards */}
               {players.map(player => (
                 <div 
                   key={player.id} 
                   onClick={player.playerId === PLAYER_ID ? () => setSelectorOpen(true) : undefined}
                   className={`group relative flex items-center bg-slate-900/40 p-6 rounded-[3rem] border transition-all ${player.playerId === PLAYER_ID ? 'border-indigo-500/50 bg-indigo-500/5 shadow-xl shadow-indigo-600/5 cursor-pointer hover:border-indigo-500 active:scale-95' : 'border-white/5 hover:border-white/10'}`}
                 >
                    {/* Avatar Container with Hover pencil effect for ME */}
                    <div className="relative w-24 h-24 bg-slate-950 rounded-[2.2rem] border border-white/5 overflow-hidden shadow-inner group-hover:scale-105 transition-all duration-500 shrink-0">
                       <img src={`/avatars/${player.avatar || 'ajani.png'}`} alt="Avatar" className="w-full h-full object-cover transition-all group-hover:opacity-60" />
                       
                       {/* Pencil Icon Overlay for current player on hover */}
                       {player.playerId === PLAYER_ID && (
                          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity">
                             <Pencil className="w-8 h-8 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                          </div>
                       )}

                       <div className={`absolute bottom-2.5 right-2.5 w-4 h-4 rounded-full border-2 border-slate-900 shadow-xl ${player.online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
                    </div>
                    
                    <div className="ml-7 flex-1 min-w-0">
                       <div className="flex flex-col gap-2">
                          <span className={`text-xl font-black uppercase tracking-tight truncate ${player.playerId === PLAYER_ID ? 'text-white' : 'text-slate-200'}`}>{player.name}</span>
                          <div className="flex items-center gap-2">
                             {player.playerId === PLAYER_ID && <span className="bg-indigo-600 text-white text-[8px] px-2.5 py-1 rounded-full font-black tracking-widest uppercase border border-indigo-400/30">TU</span>}
                             {player.playerId === players[0].playerId && <span className="bg-amber-600 text-white text-[8px] px-2.5 py-1 rounded-full font-black tracking-widest uppercase border border-amber-500/30 shadow-lg">HOST</span>}
                          </div>
                       </div>
                    </div>

                    {isHost && player.playerId !== PLAYER_ID && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); onKick(player.playerId); }}
                        className="opacity-0 group-hover:opacity-100 p-3.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl transition-all border border-red-500/20 active:scale-90 absolute -top-2 -right-2 shadow-xl"
                      >
                         <UserX className="w-5 h-5" />
                      </button>
                    )}
                 </div>
               ))}

               {/* Empty Slots */}
               {Array.from({ length: Math.max(0, targetPlayers - currentPlayers) }).map((_, i) => (
                 <div key={`empty-${i}`} className="flex items-center p-6 rounded-[3rem] border border-white/5 bg-slate-900/10 opacity-30 border-dashed animate-pulse">
                    <div className="w-24 h-24 bg-slate-950/30 rounded-[2.2rem] border border-white/5 flex items-center justify-center shrink-0">
                       <Loader2 className="w-6 h-6 text-slate-800 animate-spin" />
                    </div>
                    <span className="ml-7 text-[11px] font-black text-slate-700 uppercase tracking-[0.3em] italic">Attesa...</span>
                 </div>
               ))}
            </div>
          </div>

          {/* Action Panel */}
          <div className="lg:col-span-4 space-y-8 text-slate-200">
            <div className="bg-slate-900/30 border border-white/5 p-10 rounded-[3rem] space-y-10 shadow-2xl backdrop-blur-sm px-12">
               
               <div className="space-y-8 pb-8 border-b border-white/5">
                  <h3 className="text-xs font-black text-white uppercase tracking-[0.4em] flex items-center gap-3">
                    <Info className="w-4 h-4 text-indigo-500" /> Regole Draft
                  </h3>
                  
                  <div className="space-y-6">
                     <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest">
                        <span className="text-slate-600">Packs/Player</span>
                        <span className="text-white font-black">{rules.packsPerPlayer}</span>
                     </div>
                     <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest">
                        <span className="text-slate-600">Cards/Pack</span>
                        <span className="text-white font-black">{rules.cardsPerPack}</span>
                     </div>
                     <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest">
                        <span className="text-slate-600">Pick Timer</span>
                        <span className="text-white font-black">{rules.timer ? `${rules.timer}s` : 'OFF'}</span>
                     </div>
                     <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest">
                        <span className="text-slate-600">Rarity Balance</span>
                        <span className={rules.rarityBalance ? "text-amber-500 font-black" : "text-white font-black"}>{rules.rarityBalance ? 'ATTIVO' : 'OFF'}</span>
                     </div>
                     <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest">
                        <span className="text-slate-600">Modalità Anonima</span>
                        <span className={rules.anonymousMode ? "text-indigo-400 font-black" : "text-white font-black"}>{rules.anonymousMode ? 'ATTIVO' : 'OFF'}</span>
                     </div>
                  </div>
               </div>

               <div className="flex flex-col gap-4 pt-4">
                     {isHost ? (
                       <>
                         <button 
                           disabled={currentPlayers < 2}
                           onClick={onStart}
                           className={`w-full py-7 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-5 transition-all shadow-2xl active:scale-95 group ${currentPlayers >= 2 ? 'shadow-indigo-600/30' : 'shadow-none'}`}
                         >
                           AVVIA DRAFT <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
                         </button>
                         
                         <button 
                           onClick={onClose}
                           className="w-full py-4 text-red-500/40 hover:text-red-500 text-[10px] font-black uppercase tracking-[0.5em] transition-colors border-t border-white/5 mt-6"
                         >
                            Sciogli Lobby <X className="inline-block w-4 h-4 ml-2" />
                         </button>
                       </>
                     ) : (
                       <div className="py-12 bg-slate-950/40 rounded-3xl border border-white/5 flex flex-col items-center gap-5 text-center">
                          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                          <span className="text-[11px] font-black text-slate-600 uppercase tracking-[0.4em]">In attesa dell'host...</span>
                       </div>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* AVATAR SELECTOR MODAL */}
      {selectorOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300"
             onClick={() => setSelectorOpen(false)}
           />
           
           {/* Modal Body */}
           <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[4rem] p-12 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center mb-10">
                 <div>
                    <h3 className="text-4xl font-black text-white uppercase italic tracking-tighter">Scegli il tuo <span className="text-indigo-500">Avatar</span></h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] mt-1">Personaggi di MTG Arena</p>
                 </div>
                 <button onClick={() => setSelectorOpen(false)} className="p-4 bg-slate-800 text-slate-400 hover:text-white rounded-[1.5rem] transition-colors shadow-xl">
                    <X className="w-6 h-6" />
                 </button>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
                 {AVATARS.map(avatar => {
                   const isTaken = takenAvatars.includes(avatar);
                   const isCurrent = me?.avatar === avatar;
                   
                   return (
                     <button
                       key={avatar}
                       disabled={isTaken}
                       onClick={() => {
                         onChangeAvatar(avatar);
                         setSelectorOpen(false);
                       }}
                       className={`relative group aspect-square rounded-[2rem] overflow-hidden border-2 transition-all ${isTaken ? 'opacity-20 grayscale border-transparent cursor-not-allowed' : (isCurrent ? 'border-indigo-500 scale-105 shadow-xl shadow-indigo-600/20' : 'border-white/5 hover:border-indigo-500 hover:scale-105 active:scale-95')}`}
                     >
                       <img src={`/avatars/${avatar}`} alt={avatar} className="w-full h-full object-cover" />
                       {isTaken && (
                         <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40">
                            <X className="w-7 h-7 text-white/40" />
                         </div>
                       )}
                       {isCurrent && (
                         <div className="absolute inset-0 border-4 border-indigo-500/50 rounded-[2rem] pointer-events-none" />
                       )}
                     </button>
                   );
                 })}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
