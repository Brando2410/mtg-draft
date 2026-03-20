const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json()); // Per leggere il body JSON delle request

const AVATARS = [
  'ajani.png', 'alena_halana.png', 'angrath.png', 'aragorn.png', 'ashiok.png',
  'astarion.png', 'atraxa.png', 'aurelia.png', 'basri.png', 'baylen.png',
  'beckett.png', 'borborygmos.png', 'braids.png', 'chandra.png', 'cruelclaw.png',
  'davriel.png', 'dina.png', 'domri.png', 'dovin.png', 'elesh_norn.png'
];

// --- API REST per Salvataggio Cubi (File System) ---
const CUBES_DIR = path.join(__dirname, 'cubes');
if (!fs.existsSync(CUBES_DIR)) {
  fs.mkdirSync(CUBES_DIR);
}

const LOGS_DIR = path.join(__dirname, 'draft_logs');
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR);
}

function logDraftResult(room) {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `draft_${room.id}_${timestamp}.json`;
        const filePath = path.join(LOGS_DIR, fileName);
        
        const logData = {
            roomId: room.id,
            timestamp: new Date().toISOString(),
            cubeName: room.rules.cubeName,
            playerCount: room.players.length,
            rules: room.rules,
            players: room.players.map(p => ({
                playerId: p.playerId,
                name: p.name,
                poolCount: p.pool.length,
                pool: p.pool.map(c => ({ name: c.name, scryfall_id: c.scryfall_id, cmc: c.cmc, color: c.card_colors || c.color }))
            }))
        };
        
        fs.writeFileSync(filePath, JSON.stringify(logData, null, 2), 'utf8');
        console.log(`[BACKEND] 📜 Draft ${room.id} loggiata con successo in ${fileName}`);
    } catch (e) {
        console.error('[BACKEND] ❌ Errore durante il logging della draft:', e.message);
    }
}

// Salva un cubo
app.post('/api/cubes', (req, res) => {
  const cube = req.body;
  if (!cube || !cube.name) return res.status(400).json({ error: 'Dati cubo non validi' });

  // Pulisce il nome per usarlo come file
  const fileName = cube.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.json';
  const filePath = path.join(CUBES_DIR, fileName);

  fs.writeFile(filePath, JSON.stringify(cube, null, 2), (err) => {
    if (err) return res.status(500).json({ error: 'Errore durante il salvataggio' });
    res.json({ message: 'Cubo salvato con successo', id: fileName });
  });
});

// Lista tutti i cubi
app.get('/api/cubes', (req, res) => {
  fs.readdir(CUBES_DIR, (err, files) => {
    if (err) return res.status(500).json({ error: 'Errore durante la lettura dei cubi' });
    
    // Leggiamo i file JSON
    const cubes = files
      .filter(f => f.endsWith('.json'))
      .map(f => {
        try {
          const content = fs.readFileSync(path.join(CUBES_DIR, f), 'utf8');
          const data = JSON.parse(content);
          return { id: f, name: data.name, cardCount: data.cards?.length || 0, lastUpdated: data.lastUpdated };
        } catch (e) { return null; }
      })
      .filter(c => c !== null);

    res.json(cubes);
  });
});

// Ottieni un singolo cubo
app.get('/api/cubes/:id', (req, res) => {
  const filePath = path.join(CUBES_DIR, req.params.id);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Cubo non trovato' });

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Errore nel caricamento' });
    res.json(JSON.parse(data));
  });
});

const server = http.createServer(app);

// Configurazione Realtime con Socket.io
const io = new Server(server, {
  cors: {
    origin: '*', // Nel deployment vero si limita al dominio frontend
    methods: ['GET', 'POST']
  }
});

/**
 * PERSISTENZA STANZE (Hardened Version)
 */
const ROOMS_FILE = path.join(__dirname, '.active_rooms.json');
console.log(`[BACKEND] 📂 Percorso persistenza: ${ROOMS_FILE}`);

const saveRooms = (roomsMap) => {
  try {
    if (!roomsMap) return;
    const json = JSON.stringify(Object.fromEntries(roomsMap), null, 2);
    fs.writeFileSync(ROOMS_FILE, json, 'utf8');
    console.log(`[BACKEND] 💾 SALVATAGGIO RIUSCITO: ${roomsMap.size} stanze attive.`);
  } catch (e) { 
    console.error('[BACKEND] ❌ ERRORE CRITICO SALVATAGGIO:', e.message); 
  }
};

const loadRooms = () => {
  try {
    if (fs.existsSync(ROOMS_FILE)) {
      const content = fs.readFileSync(ROOMS_FILE, 'utf8');
      if (!content) return new Map();
      const data = JSON.parse(content);
      const roomsMap = new Map(Object.entries(data));
      console.log(`[BACKEND] 📁 CARICAMENTO RIUSCITO: ${roomsMap.size} stanze ripristinate.`);
      return roomsMap;
    }
  } catch (e) { 
    console.error('[BACKEND] ❌ ERRORE CARICAMENTO:', e.message); 
  }
  return new Map();
};

const rooms = loadRooms();

// Timer di pulizia per giocatori disconnessi (5 minuti) e Auto-Pick di sistema
setInterval(() => {
  const now = Date.now();
  let changed = false;
  
  for (const [roomId, room] of rooms.entries()) {
    // 1. Pulizia Istanze Inattive
    const playersToRemove = room.players.filter(p => !p.online && (now - p.lastSeen > 5 * 60 * 1000));
    if (playersToRemove.length > 0) {
       room.players = room.players.filter(p => p.online || (now - p.lastSeen <= 5 * 60 * 1000));
       if (room.players.length === 0 || (room.hostPlayerId && !room.players.find(p => p.playerId === room.hostPlayerId))) {
          rooms.delete(roomId);
          console.log(`🧹 Stanza ${roomId} rimossa per inattività.`);
          changed = true;
          continue;
       }
       changed = true;
    }

    room.serverTime = now;
    if (room.status === 'drafting' && !room.draftState.isPaused && room.draftState.playerTimers) {
       room.players.forEach(player => {
          const timerEnd = room.draftState.playerTimers[player.playerId];
          // Aggiunto buffer di 1s per evitare pick precoci rispetto alla visualizzazione del client
          if (timerEnd && now >= (timerEnd + 1000)) {
             const pIdx = room.players.findIndex(p => p.playerId === player.playerId);
             const queue = room.draftState.queues && room.draftState.queues[pIdx];
             const currentPack = queue && queue[0];
             
              if (currentPack && currentPack.length > 0) {
                 const playerSelections = room.draftState.selections || {};
                 const selectedId = playerSelections[player.playerId];
                 let bestCard = null;

                 if (selectedId) {
                    // Cerca la carta con ID corrispondente (uso String().trim() per sicurezza totale)
                    bestCard = currentPack.find(c => String(c.id).trim() === String(selectedId).trim());
                    if (bestCard) {
                       console.log(`[BACKEND] ⏰ Timer ${player.name} (${roomId}): 🎯 PRE-SELEZIONE TROVATA (${bestCard.name})`);
                    } else {
                       console.log(`[BACKEND] ⏰ Timer ${player.name} (${roomId}): ⚠️ Pre-selezione ${selectedId} NON nel pack.`);
                    }
                 }

                 if (!bestCard) {
                    const rarityWeights = { mythic: 4, rare: 3, uncommon: 2, common: 1 };
                    const sorted = [...currentPack].sort((a,b) => (rarityWeights[b.rarity]||0) - (rarityWeights[a.rarity]||0));
                    bestCard = sorted[0];
                    console.log(`[BACKEND] ⏰ Timer ${player.name} (${roomId}): 🎲 FALLBACK RARITY (${bestCard.name})`);
                 }

                 const success = performPick(roomId, player.playerId, bestCard.id);
                 if (success) {
                    changed = true;
                    io.to(roomId).emit('draft_update', room);
                 }
              } else {
                 console.log(`[BACKEND] ⚠️ Timer scaduto per ${player.name} ma la sua coda è vuota!`);
                 room.draftState.playerTimers[player.playerId] = null;
                 delete room.draftState.selections?.[player.playerId];
                 changed = true;
              }
          }
       });
    }
  }
  if (changed) saveRooms(rooms);
}, 1000);

// Funzione Helper per scalabilità logic
function performPick(roomId, playerId, cardId) {
    const room = rooms.get(roomId);
    if (!room || room.status !== 'drafting' || room.draftState.isPaused) return false;

    const pIdx = room.players.findIndex(p => p.playerId === playerId);
    if (pIdx === -1) return false;

    const queue = room.draftState.queues[pIdx];
    if (!queue || queue.length === 0) return false;

    const currentPack = queue[0];
    const cardIdx = currentPack.findIndex(c => c.id === cardId);
    if (cardIdx === -1) return false;

    // 1. Esegui il pick
    const [pickedCard] = currentPack.splice(cardIdx, 1);
    room.players[pIdx].pool.push(pickedCard);
    room.draftState.totalPicksInRound++;
    
    // Rimuovi la selezione corrente se esiste
    if (room.draftState.selections) {
       delete room.draftState.selections[playerId];
    }

    // 2. Rimuovi il pacchetto dalla coda attuale
    queue.shift();
    
    // 3. Sposta il pacchetto al vicino se contiene ancora carte
    if (currentPack.length > 0) {
        const numPlayers = room.players.length;
        const dir = room.draftState.round % 2 !== 0 ? 1 : -1;
        let targetIdx = (pIdx + dir) % numPlayers;
        if (targetIdx < 0) targetIdx += numPlayers;
        
        room.draftState.queues[targetIdx].push(currentPack);
        
        // Se il vicino non aveva pacchetti, facciamo partire il suo timer ora?
        // In realtà lo gestiamo sotto: se dopo il pick il player ha ancora pacchetti, gli resettiamo il timer.
    }

    // 4. Reset Timer per il giocatore che ha appena pickato (se ha ancora pacchetti in coda)
    if (queue.length > 0) {
       room.draftState.playerTimers[playerId] = Date.now() + (room.rules.timer * 1000);
    } else {
       room.draftState.playerTimers[playerId] = null;
    }

    // 5. Se il vicino ha ricevuto il pacchetto e non aveva timer attivo, attiviamolo
    room.players.forEach((p, idx) => {
       if (room.draftState.queues[idx].length > 0 && !room.draftState.playerTimers[p.playerId]) {
          room.draftState.playerTimers[p.playerId] = Date.now() + (room.rules.timer * 1000);
       }
    });

    // 6. Controllo fine Round
    const totalExpectedInRound = room.players.length * room.rules.cardsPerPack;
    if (room.draftState.totalPicksInRound >= totalExpectedInRound) {
        processNextRound(room);
    }
    
    return true;
}

function processNextRound(room) {
    room.draftState.round++;
    room.draftState.totalPicksInRound = 0;
    
    if (room.draftState.round > room.rules.packsPerPlayer) {
        room.status = 'completed';
        room.draftState.playerTimers = {};
        logDraftResult(room);
        
        // Invia l'update finale a tutti i partecipanti prima di cancellare
        io.to(room.id).emit('draft_update', room);

        // Distruzione POSTICIPATA per permettere ai client di renderizzare l'ultima vista
        console.log(`[BACKEND] 🏁 Draft completata. Stanza ${room.id} entrerà in auto-clean tra 10 secondi.`);
        setTimeout(() => {
          if (rooms.has(room.id)) {
            rooms.delete(room.id);
            saveRooms(rooms);
            console.log(`[BACKEND] 🧹 Auto-clean: Stanza ${room.id} rimossa.`);
          }
        }, 10000); // 10 secondi di grazia
    } else {
        // Distribuzione nuove buste
        room.players.forEach((p, idx) => {
            const nextPack = room.draftState.unopenedPacks[idx].shift();
            room.draftState.queues[idx] = [nextPack];
            if (room.rules.timer) {
               room.draftState.playerTimers[p.playerId] = Date.now() + (room.rules.timer * 1000);
            }
        });
        console.log(`[BACKEND] 📦 Inizio Round ${room.draftState.round}`);
    }
}

io.on('connection', (socket) => {
  console.log(`📡 Nuovo giocatore connesso: ${socket.id}`);
  socket.on('create_room', async (data) => {
    const { cubeId, hostName, playerId } = data;
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    console.log(`[BACKEND] 🏠 Creazione stanza ${roomId} richiesta da ${hostName} (${playerId})`);

    // Gestione dati piatti o annidati per le regole
    const rules = data.rules || {
      playerCount: Number(data.playerCount || 8),
      packsPerPlayer: Number(data.packsPerPlayer || 3),
      cardsPerPack: Number(data.cardsPerPack || 15),
      timer: data.timer === null ? null : Number(data.timer),
      rarityBalance: data.rarityBalance === true || data.rules?.rarityBalance === true,
      anonymousMode: data.anonymousMode === true || data.rules?.anonymousMode === true
    };

    const cubePath = path.join(CUBES_DIR, cubeId);
    let cubeData = { name: "Cubo Sconosciuto", cards: [] };
    try {
      if (fs.existsSync(cubePath)) {
        cubeData = JSON.parse(fs.readFileSync(cubePath, 'utf8'));
      }
    } catch (e) { console.error('[BACKEND] Error loading cube', e); }

    const newRoom = {
      id: roomId,
      host: socket.id,
      hostPlayerId: playerId,
      players: [ { id: socket.id, playerId, name: hostName, avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)], online: true, lastSeen: Date.now() } ],
      status: 'waiting',
      isPaused: false,
      cube: cubeData,
      rules: { ...rules, cubeName: cubeData.name || "MTG Cube" }
    };
    
    console.log(`[BACKEND] 📋 Regole Stanza ${roomId}:`, newRoom.rules);
    
    rooms.set(roomId, newRoom);
    socket.join(roomId);
    saveRooms(rooms);
    
    console.log(`[BACKEND] ✅ Stanza ${roomId} creata. Stanze attive: ${rooms.size}`);
    socket.emit('room_created', newRoom);
  });

  socket.on('join_room', ({ roomId, playerName, playerId }) => {
    console.log(`[BACKEND] 🤝 Richiesta join stanza ${roomId} da ${playerName} (${playerId})`);
    
    const room = rooms.get(roomId);
    if (!room) {
      console.log(`[BACKEND] ❌ Stanza ${roomId} non trovata. Stanze disponibili: ${Array.from(rooms.keys()).join(', ')}`);
      socket.emit('error_join', 'Stanza non trovata.');
      return;
    }

    // Identificazione STRETTA tramite playerId con fallback nome per vecchi record
    const existingPlayer = room.players.find(p => 
       p.playerId === playerId || 
       (!p.playerId && p.name === playerName)
    );
    
    if (existingPlayer) {
       console.log(`[BACKEND] 🔗 Riconnessione: ${existingPlayer.name} riassociato alla stanza ${roomId}`);
       existingPlayer.id = socket.id;
       if (!existingPlayer.playerId) existingPlayer.playerId = playerId; 
       if (!existingPlayer.avatar) existingPlayer.avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
       existingPlayer.online = true;
       existingPlayer.lastSeen = Date.now();
       
       if (room.hostPlayerId === playerId) {
          console.log(`[BACKEND] 👑 Privilegi Host ripristinati per ${existingPlayer.name} (Socket: ${socket.id})`);
          room.host = socket.id;
       }
       
       socket.join(roomId);
       socket.emit('joined_successfully', room);
       io.to(roomId).emit('room_update', room);
       saveRooms(rooms);
       return;
    }
    
    if (room.status !== 'waiting') {
      console.log(`[BACKEND] ⚠️ Join negato: stanza ${roomId} in corso.`);
      socket.emit('error_join', 'Draft già iniziata.');
      return;
    }

    if (room.players.length >= room.rules.playerCount) {
      console.log(`[BACKEND] ⚠️ Join negato: stanza ${roomId} piena.`);
      socket.emit('error_join', 'Stanza piena.');
      return;
    }
    
    console.log(`[BACKEND] 👤 Nuovo ingresso: ${playerName} aggiunto alla stanza ${roomId}`);
    const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
    room.players.push({ id: socket.id, playerId, name: playerName, avatar: randomAvatar, online: true, lastSeen: Date.now() });
    
    socket.join(roomId);
    socket.emit('joined_successfully', room);
    io.to(roomId).emit('room_update', room);
    saveRooms(rooms);
  });

  socket.on('start_draft', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room || room.host !== socket.id) return;

    const { cardsPerPack, packsPerPlayer } = room.rules;
    const totalNeeded = room.players.length * cardsPerPack * packsPerPlayer;
    const hasCount = room.cube?.cards?.length || 0;

    console.log(`[BACKEND] 🚀 Inizializzazione Draft per la stanza ${roomId}. Richieste: ${totalNeeded}, Disponibili: ${hasCount}`);
    
    // Rimosso controllo interruzione (spostato in Setup)
    // 2. Mescolamento (Shuffle) e Iniezione ID Univoci per ogni istanza di carta
    const shuffled = room.cube.cards.map((card, idx) => ({
       ...card,
       id: `${card.scryfall_id || 'c'}-${idx}-${Math.random().toString(36).substring(2, 7)}`
    })).sort(() => Math.random() - 0.5);
    
    // 3. Generazione Pack per ogni giocatore
    const unopenedPacks = []; // [playerIndex][packSlot]
    
    let cardIdx = 0;
    room.players.forEach((_, pIdx) => {
       unopenedPacks[pIdx] = [];
       for (let p = 0; p < packsPerPlayer; p++) {
          const pack = shuffled.slice(cardIdx, cardIdx + cardsPerPack);
          unopenedPacks[pIdx].push(pack);
          cardIdx += cardsPerPack;
       }
       // Reset pool giocatore
       room.players[pIdx].pool = [];
    });

    // Apriamo la prima busta per tutti e creiamo le QUEUES
    const queues = unopenedPacks.map(packs => [packs.shift()]);
    
    const playerTimers = {};
    if (room.rules.timer) {
       room.players.forEach(p => {
          playerTimers[p.playerId] = Date.now() + (room.rules.timer * 1000);
       });
    }
    
    room.draftState = {
       round: 1,
       totalPicksInRound: 0,
       unopenedPacks, 
       queues,         // Array di array: queues[pIdx] = [ pack1, pack2... ]
       playerTimers,   // ID -> timestamp
       isPaused: false,
       timeLeftPaused: null,
       selections: {}  // Registra la selezione corrente di ogni giocatore
    };

    room.status = 'drafting';
    
    console.log(`[BACKEND] ✅ Draft avviata con successo nella stanza ${roomId}`);
    io.to(roomId).emit('draft_started', room);
    saveRooms(rooms);
  });

  // Gestione Pick Carta
  socket.on('pick_card', ({ roomId, playerId, cardId }) => {
    if (performPick(roomId, playerId, cardId)) {
       const room = rooms.get(roomId);
       io.to(roomId).emit('draft_update', room);
       saveRooms(rooms);
    }
  });

  // Registrazione della selezione corrente (per auto-pick al timer scaduto)
   socket.on('select_card', ({ roomId, playerId, cardId }) => {
     const room = rooms.get(roomId);
     if (!room || room.status !== 'drafting') return;
     
     // Permettiamo la selezione anche se in pausa, così al riavvio è già pronta
     if (!room.draftState.selections) room.draftState.selections = {};
     room.draftState.selections[playerId] = cardId;
     
     console.log(`[BACKEND] 📍 Selezione aggiornata per ${playerId} in stanza ${roomId}: ${cardId || 'NULL'}`);
   });

  socket.on('kick_player', ({ roomId, playerId }) => {
    const room = rooms.get(roomId);
    if (!room) {
      console.log(`[BACKEND] ❌ Kick fallito: stanza ${roomId} non trovata in memoria.`);
      return;
    }
    
    // Verifichiamo se chi richiede il kick è l'host tramite l'ID persistente cercandolo nei players
    const requester = room.players.find(p => p.id === socket.id);
    const isHost = requester && (requester.playerId === room.hostPlayerId);

    console.log(`[BACKEND] 👢 Tentativo kick nella stanza ${roomId} per ${playerId}. Richiesto da host: ${isHost}`);

    if (isHost) {
       const playerToKick = room.players.find(p => p.playerId === playerId);
       if (playerToKick) {
          console.log(`[BACKEND] ✅ Eseguito kick per ${playerToKick.name}`);
          io.to(playerToKick.id).emit('error_join', 'Sei stato rimosso dalla stanza.');
          room.players = room.players.filter(p => p.playerId !== playerId);
          io.to(roomId).emit('room_update', room);
          saveRooms(rooms);
       }
    }
  });

  // Gestione Cambio Avatar (Hardened Version)
  socket.on('change_avatar', ({ roomId, playerId, avatar }) => {
    try {
      const room = rooms.get(roomId);
      if (!room) {
        console.log(`[BACKEND] ❌ Cambio avatar fallito: Stanza ${roomId} non trovata.`);
        return;
      }

      console.log(`[BACKEND] 🎭 Richiesta cambio avatar: Room=${roomId}, Player=${playerId}, NewAvatar=${avatar}`);

      // Troviamo il giocatore con ID persistente
      const player = room.players.find(p => p.playerId === playerId);
      if (!player) {
         console.log(`[BACKEND] ⚠️ Giocatore NON trovato per ID: ${playerId}. Cerco per socket ID...`);
         // Fallback di emergenza
         const playerBySocket = room.players.find(p => p.id === socket.id);
         if (!playerBySocket) {
             console.log(`[BACKEND] ❌ Nessun giocatore trovato nemmeno con socket.`);
             return;
         }
         playerBySocket.playerId = playerId; // Ripristiniamo legame
         playerBySocket.avatar = avatar;
      } else {
         player.avatar = avatar;
      }

      // Verifichiamo se l'avatar è già preso da qualcun altro (opzionale se vogliamo flessibilità)
      const isTaken = room.players.some(p => p.avatar === avatar && p.playerId !== playerId);
      if (isTaken) {
        console.log(`[BACKEND] 🚫 Avatar ${avatar} già occupato da un altro giocatore.`);
        socket.emit('error_join', 'Avatar già in uso da un altro giocatore.');
        return;
      }

      console.log(`[BACKEND] ✅ Avatar aggiornato correttamente per ${player?.name || 'Utente'}`);
      
      // BROADCAST IMMEDIATO
      io.to(roomId).emit('room_update', room);
      
      // PERSISTENZA
      saveRooms(rooms);

    } catch (err) {
      console.error('[BACKEND] 💥 Crash in change_avatar:', err);
    }
  });

  // Gestione Pausa Partita
  socket.on('toggle_pause', ({ roomId, playerId, forcePause = null }) => {
    const room = rooms.get(roomId);
    if (!room || room.status !== 'drafting' || room.hostPlayerId !== playerId) return;
    
    // Se forcePause è booleano usa quello, altrimenti fa il toggle normale
    const willPause = forcePause !== null ? forcePause : !room.draftState.isPaused;
    
    // Evitiamo ridondanze se lo stato è già quello richiesto
    if (room.draftState.isPaused === willPause) return;
    
    room.draftState.isPaused = willPause;

    if (willPause) {
       // Freeze di TUTTI i timer dei giocatori
       const now = Date.now();
       room.draftState.playerTimersRemaining = {};
       if (room.draftState.playerTimers) {
           Object.entries(room.draftState.playerTimers).forEach(([pid, end]) => {
              if (end) {
                 room.draftState.playerTimersRemaining[pid] = Math.max(0, end - now);
              }
           });
           room.draftState.playerTimers = {};
        }
       console.log(`[BACKEND] ⏸️ Draft ${roomId} PAUSA da ${playerId}`);
    } else {
       // Unfreeze di TUTTI i timer
       const now = Date.now();
       if (room.draftState.playerTimersRemaining) {
          Object.entries(room.draftState.playerTimersRemaining).forEach(([pid, remain]) => {
             room.draftState.playerTimers[pid] = now + remain;
          });
       }
       room.draftState.playerTimersRemaining = null;
       console.log(`[BACKEND] ▶️ Draft ${roomId} RIPARTITA da ${playerId}`);
    }
    
    io.to(roomId).emit('draft_update', room);
    saveRooms(rooms);
  });

  socket.on('destroy_room', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (room && room.host === socket.id) {
       console.log(`🧨 Stanza ${roomId} distrutta dall'host.`);
       io.to(roomId).emit('error_join', 'La stanza è stata chiusa dall\'host.');
       rooms.delete(roomId);
       saveRooms(rooms);
    }
  });

  // --- DEBUG ADMIN TOOLS ---
  socket.on('admin_get_rooms', () => {
    // Restituiamo una versione semplificata ma completa per il debug
    const roomList = Array.from(rooms.values()).map(r => ({
       id: r.id,
       status: r.status,
       playersCount: r.players.length,
       players: r.players.map(p => ({ name: p.name, online: p.online })),
       host: r.hostPlayerId,
       isPaused: r.draftState?.isPaused || false
    }));
    socket.emit('admin_rooms_list', roomList);
  });

  socket.on('admin_destroy_room', ({ roomId }) => {
    if (rooms.has(roomId)) {
       console.log(`[ADMIN] 🛡️ Forzata distruzione stanza ${roomId}`);
       io.to(roomId).emit('error_join', 'La stanza è stata chiusa dall\'amministratore per manutenzione.');
       rooms.delete(roomId);
       // Refresh della lista per l'admin
       const roomList = Array.from(rooms.values()).map(r => ({
          id: r.id,
          status: r.status,
          playersCount: r.players.length,
          players: r.players.map(p => ({ name: p.name, online: p.online })),
          isPaused: r.draftState?.isPaused || false
       }));
       socket.emit('admin_rooms_list', roomList);
       saveRooms(rooms);
    }
  });

  socket.on('disconnect', () => {
    for (const [roomId, room] of rooms.entries()) {
      const player = room.players.find(p => p.id === socket.id);
      if (player) {
        player.online = false;
        player.lastSeen = Date.now();
        
        console.log(`[BACKEND] 🔴 Disconnessione rilevata: ${player.name} in stanza ${roomId}`);
        
        if (room.status === 'drafting' && !room.draftState.isPaused) {
           room.draftState.isPaused = true;
           const now = Date.now();
           room.draftState.playerTimersRemaining = {};
           
           if (room.draftState.playerTimers) {
              Object.entries(room.draftState.playerTimers).forEach(([pid, end]) => {
                 if (end) {
                    room.draftState.playerTimersRemaining[pid] = Math.max(0, end - now);
                 }
              });
              room.draftState.playerTimers = {};
           }
           console.log(`[BACKEND] ⏸️ Draft Auto-Pausata per disconnessione giocatore.`);
           io.to(roomId).emit('draft_update', room);
        }
        
        io.to(roomId).emit('room_update', room);
        saveRooms(rooms);
        break;
      }
    }
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`─────────────────────────────────────────────`);
  console.log(`🚀 Backend Realtime in ascolto sulla porta ${PORT}`);
  console.log(`📡 Socket.io Hub Proxy Attivo`);
  console.log(`─────────────────────────────────────────────`);
});
