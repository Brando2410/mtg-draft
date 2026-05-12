import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useDraftStore } from '../../store/useDraftStore';

interface PageLayoutProps {
  children: ReactNode;
  variant?: 'default' | 'purple' | 'indigo' | 'emerald' | 'slate';
  className?: string;
  animate?: boolean;
}

export const PageLayout = ({
  children,
  variant = 'default',
  className = '',
  animate = true
}: PageLayoutProps) => {
  const { wallpaperList, fetchAssets } = useDraftStore();
  const [isLoaded, setIsLoaded] = useState(false);
  const [wallpaper, setWallpaper] = useState<string>('');

  useEffect(() => {
    if (wallpaperList.length === 0) {
      fetchAssets();
    }
  }, []);

  useEffect(() => {
    if (wallpaperList.length > 0 && !wallpaper) {
      const wpUrl = `/wallpapers/${wallpaperList[Math.floor(Math.random() * wallpaperList.length)]}`;
      setWallpaper(wpUrl);
      const img = new Image();
      img.src = wpUrl;
      img.onload = () => setIsLoaded(true);
    }
  }, [wallpaperList, wallpaper]);

  const variantGradients = {
    default: 'from-slate-950/40 via-slate-950/80 to-slate-950',
    purple: 'from-purple-950/40 via-slate-950/80 to-slate-950',
    indigo: 'from-indigo-950/40 via-slate-950/80 to-slate-950',
    emerald: 'from-emerald-950/40 via-slate-950/80 to-slate-950',
    slate: 'from-slate-900/40 via-slate-950/90 to-slate-950',
  };

  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 10 } : undefined}
      animate={animate ? { opacity: 1, y: 0 } : undefined}
      exit={animate ? { opacity: 0, y: -10 } : undefined}
      transition={animate ? { duration: 0.4, ease: "easeOut" } : undefined}
      className={`fixed inset-0 z-0 bg-slate-950 overflow-hidden flex flex-col ${className}`}
    >
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className={`absolute inset-0 transition-opacity duration-1000 ${isLoaded ? 'opacity-0' : 'opacity-100'} bg-slate-950 z-[4]`} />
        {wallpaper && (
          <div
            className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110 blur-xl'} z-[2]`}
            style={{ backgroundImage: `url(${wallpaper})` }}
          />
        )}
        <div className={`absolute inset-0 bg-gradient-to-b ${variantGradients[variant]} z-[3]`} />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 flex-1 flex flex-col min-h-0">
        {children}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </motion.div>
  );
};
