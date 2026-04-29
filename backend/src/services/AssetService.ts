import fs from 'fs';
import path from 'path';

export class AssetService {
  private static DATA_ROOT = (() => {
    const possiblePaths = [
      path.resolve(process.cwd(), 'data'),
      path.resolve(process.cwd(), '../data'),
      path.join(__dirname, '../../data'),
      path.join(__dirname, '../../../data'),
      path.join(__dirname, '../../../../data'),
      path.join(__dirname, '../../../../../data')
    ];
    const found = possiblePaths.find(p => {
      try { return fs.existsSync(p); } catch (e) { return false; }
    });
    const finalPath = found || path.resolve(process.cwd(), 'data');
    return finalPath;
  })();

  private static AVATARS_DIR = path.join(AssetService.DATA_ROOT, 'avatars');
  private static WALLPAPERS_DIR = path.join(AssetService.DATA_ROOT, 'wallpapers');

  static async listAvatars(): Promise<string[]> {
    if (!fs.existsSync(this.AVATARS_DIR)) return [];
    const files = fs.readdirSync(this.AVATARS_DIR).filter(file => /\.(png|jpg|jpeg|gif|webp)$/i.test(file));
    return files;
  }

  static async listWallpapers(): Promise<string[]> {
    if (!fs.existsSync(this.WALLPAPERS_DIR)) return [];
    const files = fs.readdirSync(this.WALLPAPERS_DIR).filter(file => /\.(png|jpg|jpeg|gif|webp)$/i.test(file));
    return files;
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
