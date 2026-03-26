import fs from 'fs';
import path from 'path';

export class AssetService {
  private static AVATARS_DIR = path.resolve(process.cwd(), '../frontend/public/avatars');
  private static WALLPAPERS_DIR = path.resolve(process.cwd(), '../frontend/public/wallpapers');

  static async listAvatars(): Promise<string[]> {
    if (!fs.existsSync(this.AVATARS_DIR)) return [];
    return fs.readdirSync(this.AVATARS_DIR).filter(file => /\.(png|jpg|jpeg|gif|webp)$/i.test(file));
  }

  static async listWallpapers(): Promise<string[]> {
    if (!fs.existsSync(this.WALLPAPERS_DIR)) return [];
    return fs.readdirSync(this.WALLPAPERS_DIR).filter(file => /\.(png|jpg|jpeg|gif|webp)$/i.test(file));
  }

  static async deleteAvatar(filename: string): Promise<boolean> {
    const filePath = path.join(this.AVATARS_DIR, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  }

  static async deleteWallpaper(filename: string): Promise<boolean> {
    const filePath = path.join(this.WALLPAPERS_DIR, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  }

  static getAvatarsDir() { return this.AVATARS_DIR; }
  static getWallpapersDir() { return this.WALLPAPERS_DIR; }
}
