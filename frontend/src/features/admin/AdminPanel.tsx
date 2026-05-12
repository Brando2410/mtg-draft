import { useState, useEffect } from 'react';
import { socket } from '../../services/socket';
import { X, Trash2, Users, Radio, Terminal, RefreshCw } from 'lucide-react';

interface AdminPanelProps {
  onClose: () => void;
}

export const AdminPanel = ({ onClose }: AdminPanelProps) => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    socket.emit('admin_get_rooms');
    
    socket.on('admin_rooms_list', (list: any[]) => {
      setRooms(list);
      setLoading(false);
    });

    const interval = setInterval(() => {
        socket.emit('admin_get_rooms');
    }, 5000);

    return () => {
      socket.off('admin_rooms_list');
      clearInterval(interval);
    };
  }, [socket]);

  const destroyRoom = (roomId: string) => {
    if (confirm(`Sei sicuro di voler distruggere la stanza ${roomId}?`)) {
      socket.emit('admin_destroy_room', { roomId });
    }
  };

  const refresh = () => {
    setLoading(true);
    socket.emit('admin_get_rooms');
  };

  return (
    <div className="fixed inset-0 z-[999] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-10 font-mono">
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-[80vh]">
        
        {/* HEADER */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/20 rounded-xl">
               <Terminal className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
               <h2 className="text-xl font-black text-white uppercase tracking-tighter leading-none">Lobby Manager</h2>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Stanze Attive: {rooms.length}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button 
                onClick={refresh}
                className={`p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl transition-all ${loading ? 'animate-spin' : ''}`}
             >
                <RefreshCw className="w-4 h-4" />
             </button>
             <button 
                onClick={onClose}
                className="p-3 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-500 rounded-xl transition-all"
             >
                <X className="w-5 h-5" />
             </button>
          </div>
        </div>

        {/* LIST */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {rooms.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
               <Radio className="w-12 h-12 opacity-20" />
               <p className="text-xs uppercase tracking-[0.3em] font-bold">Nessuna lobby trovata</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rooms.map((room) => (
                <div key={room.id} className="p-6 bg-slate-950 border border-white/5 rounded-3xl hover:border-indigo-500/30 transition-all group">
                   <div className="flex items-start justify-between mb-6">
                      <div>
                         <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl font-black text-white tracking-tighter uppercase">{room.id}</span>
                            <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${
                               room.status === 'drafting' ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500'
                            }`}>
                               {room.status}
                            </span>
                         </div>
                         <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Host ID: {room.host?.substring(0,8)}...</p>
                      </div>
                      
                      <button 
                         onClick={() => destroyRoom(room.id)}
                         className="p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl transition-all"
                         title="Distruggi Stanza"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
                   </div>

                   <div className="space-y-3">
                      <div className="flex items-center gap-2 text-slate-400">
                         <Users className="w-3 h-3" />
                         <span className="text-[10px] font-bold uppercase tracking-widest">Giocatori ({room.playersCount})</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                         {room.players.map((p: any, i: number) => (
                            <div key={i} className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                               <div className={`w-1.5 h-1.5 rounded-full ${p.online ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                               <span className="text-[9px] font-bold text-slate-300">{p.name}</span>
                            </div>
                         ))}
                      </div>
                   </div>

                   {room.isPaused && (
                      <div className="mt-4 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                         <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Draft in Pausa</span>
                      </div>
                   )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
