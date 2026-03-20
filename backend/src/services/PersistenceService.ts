import fs from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import { Room, Card } from '@shared/types';
import { LoggerService } from './LoggerService';

export class PersistenceService {
  private static CUBES_DIR = path.join(__dirname, '../../cubes');
  private static LOGS_DIR = path.join(__dirname, '../../draft_logs');
  private static ROOMS_FILE = path.join(__dirname, '../../.active_rooms.json');

  static init() {
    if (!existsSync(this.CUBES_DIR)) mkdirSync(this.CUBES_DIR, { recursive: true });
    if (!existsSync(this.LOGS_DIR)) mkdirSync(this.LOGS_DIR, { recursive: true });
  }

  static async saveRooms(roomsMap: Map<string, Room>) {
    try {
      const data = Object.fromEntries(roomsMap);
      const json = JSON.stringify(data, null, 2);
      await fs.writeFile(this.ROOMS_FILE, json, 'utf8');
      LoggerService.info('PERSISTENCE', `Rooms saved successfully: ${roomsMap.size} active rooms`);
    } catch (e: any) {
      LoggerService.error('PERSISTENCE', 'Critical error during room saving', e);
    }
  }

  static async loadRooms(): Promise<Map<string, Room>> {
    try {
      if (existsSync(this.ROOMS_FILE)) {
        const content = await fs.readFile(this.ROOMS_FILE, 'utf8');
        if (!content) return new Map();
        const data = JSON.parse(content);
        const roomsMap = new Map<string, Room>(Object.entries(data));
        LoggerService.info('PERSISTENCE', `Rooms loaded successfully: ${roomsMap.size} rooms restored`);
        return roomsMap;
      }
    } catch (e: any) {
      LoggerService.error('PERSISTENCE', 'Error during room loading', e);
    }
    return new Map();
  }

  static async saveCube(cube: { name: string, cards: Card[] }) {
    const fileName = cube.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.json';
    const filePath = path.join(this.CUBES_DIR, fileName);
    await fs.writeFile(filePath, JSON.stringify(cube, null, 2));
    return fileName;
  }

  static async listCubes() {
    const files = await fs.readdir(this.CUBES_DIR);
    const cubes = await Promise.all(
      files
        .filter(f => f.endsWith('.json'))
        .map(async (f: string) => {
          try {
            const content = await fs.readFile(path.join(this.CUBES_DIR, f), 'utf8');
            const data = JSON.parse(content);
            return { id: f, name: data.name, cardCount: data.cards?.length || 0, lastUpdated: data.lastUpdated };
          } catch (e: any) { return null; }
        })
    );
    return cubes.filter(c => c !== null);
  }

  static async getCube(id: string) {
    const filePath = path.join(this.CUBES_DIR, id);
    if (!existsSync(filePath)) return null;
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  }

  static async deleteCube(id: string) {
    const filePath = path.join(this.CUBES_DIR, id);
    if (existsSync(filePath)) {
      await fs.unlink(filePath);
      return true;
    }
    return false;
  }

  static async logDraftResult(room: Room) {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `draft_${room.id}_${timestamp}.json`;
      const filePath = path.join(this.LOGS_DIR, fileName);
      
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
      
      await fs.writeFile(filePath, JSON.stringify(logData, null, 2), 'utf8');
      LoggerService.info('PERSISTENCE', `Draft result logged: ${fileName}`, { roomId: room.id, fileName });
    } catch (e: any) {
      LoggerService.error('PERSISTENCE', `Error logging draft result for room ${room.id}`, e);
    }
  }
}
