import { Room, Card, Player } from '@shared/types';
import { PersistenceService } from './PersistenceService';
import { LoggerService } from './LoggerService';

export class DraftService {
   static performPick(rooms: Map<string, Room>, roomId: string, playerId: string, cardId: string): boolean {
      const room = rooms.get(roomId);
      if (!room) {
         LoggerService.warn('DRAFT', `Pick failed: Room ${roomId} not found`, { roomId, playerId });
         return false;
      }
      if (room.status !== 'drafting' || room.isPaused) {
         LoggerService.warn('DRAFT', `Pick rejected: Room ${roomId} is ${room.status} or paused`, { roomId, playerId, status: room.status, isPaused: room.isPaused });
         return false;
      }

      const pIdx = room.players.findIndex((p: Player) => p.playerId === playerId);
      if (pIdx === -1 || !room.draftState) return false;

      const queue = room.draftState.queues[pIdx];
      if (!queue || queue.length === 0) return false;

      const currentPack = queue[0];
      const cardIdx = currentPack.findIndex((c: Card) => c.id === cardId);
      if (cardIdx === -1) return false;

      // 1. Esegui il pick
      const [pickedCard] = currentPack.splice(cardIdx, 1);
      room.players[pIdx].pool.push(pickedCard);
      LoggerService.info('DRAFT', `Pick confirmed: ${room.players[pIdx].name} took ${pickedCard.name}`, { roomId, playerId, cardName: pickedCard.name });
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
         const dir = room.draftState.round % 2 !== 0 ? -1 : 1;
         let targetIdx = (pIdx + dir) % numPlayers;
         if (targetIdx < 0) targetIdx += numPlayers;

         room.draftState.queues[targetIdx].push(currentPack);
         LoggerService.debug('DRAFT', `Pack rotated from ${room.players[pIdx].name} to neighbor`, { roomId, fromIdx: pIdx, toIdx: targetIdx });
      }

      // 4. Reset Timer per il giocatore che ha appena pickato (se ha ancora pacchetti in coda)
      if (queue.length > 0 && room.rules.timer) {
         room.draftState.playerTimers[playerId] = Date.now() + (room.rules.timer * 1000);
      } else {
         room.draftState.playerTimers[playerId] = null;
      }

      // 5. Se il vicino ha ricevuto il pacchetto e non aveva timer attivo, attiviamolo
      const timerVal = room.rules.timer;
      if (timerVal) {
         room.players.forEach((p: Player, idx: number) => {
            if (room.draftState!.queues[idx].length > 0 && !room.draftState!.playerTimers[p.playerId]) {
               room.draftState!.playerTimers[p.playerId] = Date.now() + (timerVal * 1000);
            }
         });
      }

      // 6. Controllo fine Round
      const totalExpectedInRound = room.players.length * room.rules.cardsPerPack;
      if (room.draftState.totalPicksInRound >= totalExpectedInRound) {
         this.processNextRound(room);
      }

      return true;
   }

   static processNextRound(room: Room) {
      if (!room.draftState) return;

      room.draftState.round++;
      room.draftState.totalPicksInRound = 0;

      if (room.draftState.round > room.rules.packsPerPlayer) {
         room.status = 'completed';
         room.draftState.playerTimers = {};
         PersistenceService.logDraftResult(room);

         LoggerService.info('DRAFT', `Draft completed in room: ${room.id}`, { roomId: room.id, playerCount: room.players.length });
      } else {
         // Distribuzione nuove buste
         room.players.forEach((p: Player, idx: number) => {
            const nextPack = room.draftState!.unopenedPacks[idx].shift();
            if (nextPack) {
               room.draftState!.queues[idx] = [nextPack];
               if (room.rules.timer) {
                  room.draftState!.playerTimers[p.playerId] = Date.now() + (room.rules.timer * 1000);
               }
            }
         });
         LoggerService.info('DRAFT', `Starting Round ${room.draftState.round}`, { roomId: room.id, round: room.draftState.round });
      }
   }

   static startDraft(room: Room) {
      const { cardsPerPack, packsPerPlayer } = room.rules;

      // Shuffle and inject IDs
      const shuffled = room.cube.cards.map((card: Card, idx: number) => ({
         ...card,
         id: `${card.scryfall_id || 'c'}-${idx}-${Math.random().toString(36).substring(2, 7)}`
      })).sort(() => Math.random() - 0.5);

      const unopenedPacks: Card[][][] = []; // [playerIndex][packSlot]

      let cardIdx = 0;
      room.players.forEach((_: Player, pIdx: number) => {
         unopenedPacks[pIdx] = [];
         for (let p = 0; p < packsPerPlayer; p++) {
            const pack = shuffled.slice(cardIdx, cardIdx + cardsPerPack);
            unopenedPacks[pIdx].push(pack);
            cardIdx += cardsPerPack;
         }
         room.players[pIdx].pool = [];
      });

      const queues = unopenedPacks.map(packs => [packs.shift()!]);

      const playerTimers: Record<string, number | null> = {};
      if (room.rules.timer) {
         room.players.forEach((p: Player) => {
            playerTimers[p.playerId] = Date.now() + (room.rules.timer! * 1000);
         });
      }

      room.draftState = {
         round: 1,
         totalPicksInRound: 0,
         unopenedPacks,
         queues,
         playerTimers,
         isPaused: false,
         timeLeftPaused: null,
         selections: {}
      };

      room.status = 'drafting';
   }

}
